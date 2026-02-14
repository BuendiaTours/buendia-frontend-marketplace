import { dev } from '$app/environment';
import { apiConfig } from '$api-shared/config';
import type { ApiRequestOptions, ApiResponse, AuthProvider } from '$api-shared/types';
import {
	ApiError,
	createNetworkError,
	createTimeoutError,
	createNotFoundError,
	createUnauthorizedError,
	createForbiddenError,
	createValidationError,
	createServerError,
	createUnknownError
} from '$api-shared/errors';

/** Historial de requests para debugging de throttling (solo en DEV) */
export type QueryLogEntry = { n: number; method: string; path: string; ts: string };

const queryLog: QueryLogEntry[] = [];
const QUERY_LOG_MAX = 200; // Guardar últimas N para no consumir mucha memoria

export class ApiClient {
	private config: typeof apiConfig;
	private authProvider?: AuthProvider;
	private queryCount = 0;

	constructor(config: typeof apiConfig) {
		this.config = config;
	}

	setAuthProvider(provider: AuthProvider) {
		this.authProvider = provider;
	}

	/** Obtiene el número total de queries en esta sesión (para debug de throttling) */
	getQueryCount(): number {
		return this.queryCount;
	}

	/** Resetea el contador de queries (para testing o empezar a contar desde cero) */
	resetQueryCount(): void {
		this.queryCount = 0;
		queryLog.length = 0;
	}

	private log(level: 'info' | 'error', message: string, data?: unknown) {
		if (this.config.debug) {
			console[level](`[API] ${message}`, data || '');
		}
	}

	private isRetryable(error: unknown): boolean {
		// Network errors (TypeError from fetch) are retryable
		if (error instanceof Error && error.name === 'TypeError') return true;

		// HTTP responses with retryable status codes
		if (error instanceof Response) {
			return this.config.retry.retryOn.includes(error.status as never);
		}

		// ApiError timeouts are NOT retryable (already waited once)
		// ApiError network errors ARE retryable
		if (error instanceof ApiError) {
			return error.type === 'network';
		}

		return false;
	}

	private async withRetry<T>(
		fn: () => Promise<T>,
		attempts: number,
		delay: number,
		backoff: number
	): Promise<T> {
		let lastError: unknown;

		for (let attempt = 1; attempt <= attempts; attempt++) {
			try {
				return await fn();
			} catch (error) {
				lastError = error;

				if (attempt < attempts && this.isRetryable(error)) {
					const waitTime = delay * Math.pow(backoff, attempt - 1);
					this.log('info', `Retry attempt ${attempt}/${attempts} after ${waitTime}ms`);
					await new Promise((resolve) => setTimeout(resolve, waitTime));
					continue;
				}

				throw error;
			}
		}

		throw lastError;
	}

	private async withTimeout(
		fetchFn: typeof fetch,
		url: string,
		options: RequestInit,
		timeout: number
	): Promise<Response> {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		try {
			const res = await fetchFn(url, {
				...options,
				signal: controller.signal
			});
			clearTimeout(timeoutId);
			return res;
		} catch (err) {
			clearTimeout(timeoutId);
			if (err instanceof Error && err.name === 'AbortError') {
				throw createTimeoutError(url);
			}
			throw err;
		}
	}

	private async getAuthHeaders(): Promise<Record<string, string>> {
		if (!this.authProvider) return {};

		const token = await this.authProvider.getToken();
		if (!token) return {};
		return this.authProvider.formatHeaders(token);
	}

	private async handleErrorResponse(response: Response, url: string) {
		let data: unknown = null;

		try {
			const contentType = response.headers.get('content-type');
			if (contentType?.includes('application/json')) {
				data = await response.json();
			} else {
				data = await response.text();
			}
		} catch {
			// Ignore parse errors
		}

		switch (response.status) {
			case 404:
				return createNotFoundError(url, data);
			case 401:
				return createUnauthorizedError(url, data);
			case 403:
				return createForbiddenError(url, data);
			case 422:
				return createValidationError(url, data);
			case 500:
			case 502:
			case 503:
			case 504:
				return createServerError(url, response.status, data);
			default:
				return createServerError(url, response.status, data);
		}
	}

	async request<T>(
		fetchFn: typeof fetch,
		path: string,
		options?: ApiRequestOptions
	): Promise<ApiResponse<T>> {
		const url = `${this.config.baseURL}${path}`;
		const timeout = options?.timeout ?? this.config.timeout;
		const retryAttempts =
			options?.retry === false
				? 0
				: typeof options?.retry === 'number'
					? options.retry
					: this.config.retry.attempts;

		const authHeaders = await this.getAuthHeaders();

		const headers = {
			...this.config.headers,
			...authHeaders,
			...options?.headers
		};

		const requestOptions: RequestInit = {
			...options,
			headers
		};

		const method = options?.method || 'GET';
		const pathForLog = url.replace(this.config.baseURL, '') || '/';

		if (!options?.silent) {
			this.log('info', `${method} ${url}`);
		}

		// Contador de queries (útil para debug de throttling)
		this.queryCount++;
		if (this.config.debug) {
			const entry: QueryLogEntry = {
				n: this.queryCount,
				method,
				path: pathForLog,
				ts: new Date().toISOString()
			};
			queryLog.push(entry);
			if (queryLog.length > QUERY_LOG_MAX) queryLog.shift();
			console.log(`[API] Query #${this.queryCount} ${method} ${pathForLog}`);
		}

		try {
			const response = await this.withRetry(
				() => this.withTimeout(fetchFn, url, requestOptions, timeout),
				retryAttempts + 1,
				this.config.retry.delay,
				this.config.retry.backoff
			);

			if (!response.ok) {
				throw await this.handleErrorResponse(response, url);
			}

			const contentType = response.headers.get('content-type');
			let data: T;

			if (contentType?.includes('application/json')) {
				data = await response.json();
			} else if (response.status === 204) {
				data = undefined as T;
			} else {
				data = (await response.text()) as T;
			}

			if (!options?.silent) {
				this.log('info', `Success: ${url}`, { status: response.status });
			}

			if (dev) {
				console.log(
					`[API] Backend response ${method} ${pathForLog}:`,
					JSON.stringify(data, null, 2)
				);
			}

			return {
				data,
				status: response.status,
				headers: response.headers
			};
		} catch (err) {
			if (!options?.silent) {
				this.log('error', `Failed: ${url}`, err);
			}

			if (err instanceof Error && err.name === 'TypeError') {
				throw createNetworkError(url);
			}

			if (err instanceof Error) {
				throw err;
			}

			throw createUnknownError(url, err);
		}
	}
}

export const apiClient = new ApiClient(apiConfig);

/**
 * Obtiene el número total de queries realizadas en esta sesión/proceso.
 * Útil para verificar si se acerca al límite de throttling del backend.
 */
export function getQueryCount(): number {
	return apiClient.getQueryCount();
}

/**
 * Obtiene el historial de las últimas queries (solo en DEV).
 * Útil para analizar qué está disparando el throttle.
 */
export function getQueryLog(): QueryLogEntry[] {
	return [...queryLog];
}

/**
 * Resetea el contador y el log. Útil para testing o para empezar a contar desde cero.
 */
export function resetQueryCount(): void {
	apiClient.resetQueryCount();
}
