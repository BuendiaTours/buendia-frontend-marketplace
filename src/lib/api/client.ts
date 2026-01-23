import { apiConfig } from './config';
import type { ApiRequestOptions, ApiResponse, AuthProvider } from './types';
import {
	createNetworkError,
	createTimeoutError,
	createNotFoundError,
	createUnauthorizedError,
	createForbiddenError,
	createValidationError,
	createServerError,
	createUnknownError
} from './errors';

export class ApiClient {
	private config: typeof apiConfig;
	private authProvider?: AuthProvider;

	constructor(config: typeof apiConfig) {
		this.config = config;
	}

	setAuthProvider(provider: AuthProvider) {
		this.authProvider = provider;
	}

	private log(level: 'info' | 'error', message: string, data?: unknown) {
		if (this.config.debug) {
			console[level](`[API] ${message}`, data || '');
		}
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

				if (attempt < attempts) {
					const isRetryable =
						error instanceof Response && this.config.retry.retryOn.includes(error.status as never);

					if (isRetryable) {
						const waitTime = delay * Math.pow(backoff, attempt - 1);
						this.log('info', `Retry attempt ${attempt}/${attempts} after ${waitTime}ms`);
						await new Promise((resolve) => setTimeout(resolve, waitTime));
						continue;
					}
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

		try {
			const token = await this.authProvider.getToken();
			if (!token) return {};
			return this.authProvider.formatHeaders(token);
		} catch (error) {
			this.log('error', 'Failed to get auth headers', error);
			return {};
		}
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

		if (!options?.silent) {
			this.log('info', `${options?.method || 'GET'} ${url}`);
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
