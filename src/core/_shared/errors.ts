/**
 * @module _shared/errors
 * @description Typed error hierarchy for API failures.
 * Every non-2xx response or transport failure is mapped to an {@link ApiError}
 * with a discriminated `type` field, making it easy to pattern-match in catch blocks.
 * The {@link handleApiError} utility further converts these into SvelteKit `HttpError`
 * responses suitable for server load functions.
 */

import { error as httpError } from '@sveltejs/kit';
import type { ApiErrorDetails, ApiErrorType } from '$core/_shared/types';

/**
 * Structured error thrown by the API client for every failed request.
 *
 * The {@link type} discriminant allows consumers to branch on the failure cause
 * without inspecting status codes directly:
 *
 * ```ts
 * catch (err) {
 *   if (err instanceof ApiError && err.type === 'not_found') { ... }
 * }
 * ```
 */
export class ApiError extends Error {
	/** Discriminant indicating the category of failure (e.g. `network`, `timeout`, `not_found`). */
	type: ApiErrorType;
	/** HTTP status code, when available. */
	status?: number;
	/** HTTP status text, when available. */
	statusText?: string;
	/** The original request URL that produced the error. */
	url: string;
	/** Optional response body or additional context from the backend. */
	data?: unknown;

	constructor(details: ApiErrorDetails) {
		super(details.message);
		this.name = 'ApiError';
		this.type = details.type;
		this.status = details.status;
		this.statusText = details.statusText;
		this.url = details.url;
		this.data = details.data;

		Object.setPrototypeOf(this, ApiError.prototype);
	}
}

/**
 * Creates a network-level error (e.g. DNS failure, no connectivity).
 * @param url - The URL that could not be reached.
 */
export function createNetworkError(url: string): ApiError {
	return new ApiError({
		type: 'network',
		message: 'Network error: Unable to reach the server',
		url
	});
}

/**
 * Creates a timeout error when the request exceeds the configured deadline.
 * @param url - The URL whose response was not received in time.
 */
export function createTimeoutError(url: string): ApiError {
	return new ApiError({
		type: 'timeout',
		message: 'Request timeout: The server took too long to respond',
		url
	});
}

/**
 * Creates a 404 Not Found error.
 * @param url - The URL that returned 404.
 * @param data - Optional response body.
 */
export function createNotFoundError(url: string, data?: unknown): ApiError {
	return new ApiError({
		type: 'not_found',
		message: 'Resource not found',
		status: 404,
		statusText: 'Not Found',
		url,
		data
	});
}

/**
 * Creates a 401 Unauthorized error.
 * @param url - The URL that returned 401.
 * @param data - Optional response body.
 */
export function createUnauthorizedError(url: string, data?: unknown): ApiError {
	return new ApiError({
		type: 'unauthorized',
		message: 'Unauthorized: Authentication required',
		status: 401,
		statusText: 'Unauthorized',
		url,
		data
	});
}

/**
 * Creates a 403 Forbidden error.
 * @param url - The URL that returned 403.
 * @param data - Optional response body.
 */
export function createForbiddenError(url: string, data?: unknown): ApiError {
	return new ApiError({
		type: 'forbidden',
		message: 'Forbidden: Access denied',
		status: 403,
		statusText: 'Forbidden',
		url,
		data
	});
}

/**
 * Creates a 422 Validation error (typically malformed request body).
 * @param url - The URL that returned 422.
 * @param data - Optional validation details from the backend.
 */
export function createValidationError(url: string, data?: unknown): ApiError {
	return new ApiError({
		type: 'validation',
		message: 'Validation error: Invalid data provided',
		status: 422,
		statusText: 'Unprocessable Entity',
		url,
		data
	});
}

/**
 * Creates a server error for 5xx status codes.
 * @param url - The URL that returned a server error.
 * @param status - The specific HTTP status code (500, 502, 503, 504, etc.).
 * @param data - Optional response body.
 */
export function createServerError(url: string, status: number, data?: unknown): ApiError {
	return new ApiError({
		type: 'server_error',
		message: `Server error: ${status}`,
		status,
		statusText: 'Internal Server Error',
		url,
		data
	});
}

/**
 * Creates a catch-all error for unrecognised failure modes.
 * @param url - The URL associated with the failure.
 * @param error - The original thrown value.
 */
export function createUnknownError(url: string, error: unknown): ApiError {
	return new ApiError({
		type: 'unknown',
		message: error instanceof Error ? error.message : 'Unknown error occurred',
		url,
		data: error
	});
}

/**
 * Converts an unknown caught error into a SvelteKit HttpError.
 * Distinguishes ApiError types to return appropriate status codes and messages.
 *
 * @param err - The caught error (typically from an API call).
 * @param resourceLabel - Human-readable label for the resource (used in user-facing messages).
 * @throws SvelteKit `HttpError` — always throws, never returns.
 *
 * @example
 * ```ts
 * catch (err) {
 *   throw handleApiError(err, 'los datos');
 * }
 * ```
 */
export function handleApiError(err: unknown, resourceLabel: string): never {
	if (err instanceof ApiError) {
		const msg =
			err.type === 'not_found'
				? `No se encontró ${resourceLabel}`
				: err.type === 'server_error'
					? 'El servidor no está disponible. Por favor, inténtalo más tarde.'
					: err.type === 'timeout'
						? 'La solicitud tardó demasiado. Por favor, inténtalo de nuevo.'
						: err.type === 'network'
							? 'No se pudo conectar con el servidor.'
							: `Error al cargar ${resourceLabel} (${err.status || 'desconocido'})`;

		throw httpError(err.status || 500, msg);
	}

	throw httpError(503, 'No se pudo conectar con el servidor.');
}
