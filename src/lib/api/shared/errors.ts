import type { ApiErrorDetails, ApiErrorType } from './types';

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
