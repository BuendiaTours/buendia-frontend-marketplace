/**
 * @module _shared/types
 * @description Shared TypeScript types used across the entire core API layer.
 * These types define the contracts for error handling, request/response shapes,
 * authentication, criteria results, and common value objects.
 */

/** Discriminant values for {@link ApiError} instances. */
export type ApiErrorType =
	| 'network'
	| 'timeout'
	| 'not_found'
	| 'unauthorized'
	| 'forbidden'
	| 'validation'
	| 'server_error'
	| 'unknown';

/** Constructor payload for {@link ApiError}. */
export type ApiErrorDetails = {
	/** Category of the failure. */
	type: ApiErrorType;
	/** Human-readable error message. */
	message: string;
	/** HTTP status code (absent for network/timeout errors). */
	status?: number;
	/** HTTP status text (e.g. "Not Found"). */
	statusText?: string;
	/** The URL that produced the error. */
	url: string;
	/** Optional response body or additional context. */
	data?: unknown;
};

/**
 * Extended `RequestInit` with additional options recognised by {@link ApiClient}.
 *
 * @property timeout - Per-request timeout override in milliseconds.
 * @property retry - `false` to disable retries, or a number to override the max retry count.
 * @property silent - When `true`, suppresses debug logging for this request.
 */
export type ApiRequestOptions = RequestInit & {
	timeout?: number;
	retry?: boolean | number;
	silent?: boolean;
	tag?: string;
};

/**
 * Typed wrapper returned by {@link ApiClient.request}.
 * @template T - Shape of the parsed response body.
 */
export type ApiResponse<T> = {
	/** Parsed response body. */
	data: T;
	/** HTTP status code. */
	status: number;
	/** Raw response headers. */
	headers: Headers;
};

/**
 * Strategy for attaching authentication credentials to outgoing requests.
 * Registered on the {@link ApiClient} via `setAuthProvider()`.
 */
export type AuthProvider = {
	/** Retrieves the current authentication token (or `null` if unauthenticated). */
	getToken(): Promise<string | null>;
	/** Formats the token into one or more HTTP headers (e.g. `Authorization: Bearer …`). */
	formatHeaders(token: string): Record<string, string>;
};

/**
 * Standard paginated response envelope returned by criteria-based list endpoints.
 * @template T - Type of each item in the result set.
 */
export type CriteriaResult<T> = {
	/** Array of matching records for the current page. */
	data: T[];
	/** Total number of records matching the query (across all pages). */
	total: number;
};

/** Geographic coordinate pair (WGS 84). */
export type Coords = {
	latitude: number;
	longitude: number;
};
