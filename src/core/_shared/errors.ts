import { error as httpError } from '@sveltejs/kit';
import type { ApiErrorDetails, ApiErrorType } from '$core/_shared/types';

export class ApiError extends Error {
	type: ApiErrorType;
	status?: number;
	statusText?: string;
	url: string;
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

export function createNetworkError(url: string): ApiError {
	return new ApiError({
		type: 'network',
		message: 'Network error: Unable to reach the server',
		url
	});
}

export function createTimeoutError(url: string): ApiError {
	return new ApiError({
		type: 'timeout',
		message: 'Request timeout: The server took too long to respond',
		url
	});
}

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
 * Usage in server load functions:
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
