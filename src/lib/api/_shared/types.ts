export type ApiErrorType =
	| 'network'
	| 'timeout'
	| 'not_found'
	| 'unauthorized'
	| 'forbidden'
	| 'validation'
	| 'server_error'
	| 'unknown';

export type ApiErrorDetails = {
	type: ApiErrorType;
	message: string;
	status?: number;
	statusText?: string;
	url: string;
	data?: unknown;
};

export type ApiRequestOptions = RequestInit & {
	timeout?: number;
	retry?: boolean | number;
	silent?: boolean;
};

export type ApiResponse<T> = {
	data: T;
	status: number;
	headers: Headers;
};

export interface AuthProvider {
	getToken(): Promise<string | null>;
	formatHeaders(token: string): Record<string, string>;
}

export type CriteriaResult<T> = {
	data: T[];
	total: number;
};
