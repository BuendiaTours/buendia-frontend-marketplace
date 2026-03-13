/**
 * @module _shared/client
 * @description Core HTTP client for all API communication.
 * Wraps the native `fetch` with retry logic, request timeouts, authentication
 * header injection, and structured error handling. A singleton {@link apiClient}
 * is exported and consumed by the helper functions in `helpers.ts`.
 */

import { logger } from '$lib/utils/logger';
import { apiConfig } from '$core/_shared/config';
import type { ApiRequestOptions, ApiResponse, AuthProvider } from '$core/_shared/types';
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
} from '$core/_shared/errors';

/** Single entry recorded in the dev-only query log for throttling analysis. */
export type QueryLogEntry = { n: number; method: string; path: string; ts: string };

const queryLog: QueryLogEntry[] = [];
const QUERY_LOG_MAX = 200;

/**
 * Low-level API client that handles every outgoing HTTP request.
 *
 * Responsibilities:
 * - Prepend the configured base URL to every path.
 * - Apply request timeout via `AbortController`.
 * - Retry transient failures (network errors, 5xx) with exponential back-off.
 * - Inject authentication headers when an {@link AuthProvider} is registered.
 * - Parse JSON / text responses and map HTTP errors to typed {@link ApiError} instances.
 * - Keep a dev-only query counter & log useful for spotting throttling issues.
 */
export class ApiClient {
	private config: typeof apiConfig;
	private authProvider?: AuthProvider;
	private queryCount = 0;

	/** @param config - Global API configuration (base URL, timeouts, retry policy, headers). */
	constructor(config: typeof apiConfig) {
		this.config = config;
	}

	/**
	 * Registers an authentication provider used to attach auth headers to every request.
	 * @param provider - Object that supplies the current token and formats it into headers.
	 */
	setAuthProvider(provider: AuthProvider) {
		this.authProvider = provider;
	}

	/** Returns the total number of requests made during this process (useful for throttling debugging). */
	getQueryCount(): number {
		return this.queryCount;
	}

	/** Resets the query counter and the in-memory query log. */
	resetQueryCount(): void {
		this.queryCount = 0;
		queryLog.length = 0;
	}

	/**
	 * Internal logger that only emits when `config.debug` is enabled.
	 * @param level - Severity level.
	 * @param message - Human-readable message.
	 * @param data - Optional payload to log alongside the message.
	 */
	private log(level: 'info' | 'error', message: string, data?: unknown) {
		if (this.config.debug) {
			logger[level === 'info' ? 'log' : 'error'](`[API] ${message}`, data || '');
		}
	}

	/**
	 * Determines whether a failed request should be retried.
	 * Network-level `TypeError`s and responses with retryable status codes qualify.
	 * @param error - The caught error or Response.
	 */
	private isRetryable(error: unknown): boolean {
		if (error instanceof Error && error.name === 'TypeError') return true;

		if (error instanceof Response) {
			return this.config.retry.retryOn.includes(error.status as never);
		}

		if (error instanceof ApiError) {
			return error.type === 'network';
		}

		return false;
	}

	/**
	 * Executes a function with automatic retry and exponential back-off.
	 * @param fn - The async operation to attempt.
	 * @param attempts - Maximum number of attempts.
	 * @param delay - Initial delay in milliseconds between retries.
	 * @param backoff - Multiplier applied to the delay after each retry.
	 * @returns The result of the first successful invocation.
	 * @throws The last error if all attempts are exhausted.
	 */
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

	/**
	 * Wraps a `fetch` call with an `AbortController`-based timeout.
	 * @param fetchFn - The SvelteKit-provided fetch function.
	 * @param url - Fully-qualified request URL.
	 * @param options - Standard `RequestInit` options forwarded to fetch.
	 * @param timeout - Maximum wait time in milliseconds before aborting.
	 * @returns The HTTP response if it arrives within the timeout window.
	 * @throws {@link ApiError} with type `timeout` when the deadline is exceeded.
	 */
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

	/**
	 * Builds authentication headers using the registered {@link AuthProvider}.
	 * @returns A record with the auth header(s), or an empty object if no provider is set.
	 */
	private async getAuthHeaders(): Promise<Record<string, string>> {
		if (!this.authProvider) return {};

		const token = await this.authProvider.getToken();
		if (!token) return {};
		return this.authProvider.formatHeaders(token);
	}

	/**
	 * Reads the body of a non-OK response and maps it to the appropriate {@link ApiError} subtype.
	 * @param response - The HTTP response with a non-2xx status.
	 * @param url - The original request URL (included in the error for debugging).
	 * @returns A typed {@link ApiError} instance.
	 */
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

	/**
	 * Performs an HTTP request through the centralized pipeline (auth, timeout, retry, error mapping).
	 *
	 * @template T - Expected shape of the response body.
	 * @param fetchFn - The SvelteKit-provided `fetch` (ensures cookies and SSR compatibility).
	 * @param path - API path relative to the configured base URL (e.g. `/activities`).
	 * @param options - Extended request options including timeout, retry, and silence overrides.
	 * @returns A typed {@link ApiResponse} containing the parsed data, status code, and headers.
	 * @throws {@link ApiError} when the request fails at any stage.
	 */
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

/** Pre-configured singleton client instance used across the application. */
export const apiClient = new ApiClient(apiConfig);

/**
 * Returns the total number of API requests issued during this process.
 * Useful for detecting whether the application is approaching a backend throttle limit.
 */
export function getQueryCount(): number {
	return apiClient.getQueryCount();
}

/**
 * Returns a shallow copy of the most recent query log entries (dev-only).
 * Helpful for analysing which requests are triggering throttle limits.
 */
export function getQueryLog(): QueryLogEntry[] {
	return [...queryLog];
}

/**
 * Resets both the query counter and the in-memory log.
 * Intended for testing or when a fresh counting window is needed.
 */
export function resetQueryCount(): void {
	apiClient.resetQueryCount();
}
