/**
 * @module _shared/config
 * @description Global API configuration consumed by {@link ApiClient}.
 * All values are read-only at runtime (`as const`).
 */

import { PUBLIC_API_BASE_URL, PUBLIC_BS_BASE_URL } from '$env/static/public';

declare const __APP_VERSION__: string;

/**
 * Central configuration object for the API client.
 *
 * @property baseURL - Root URL of the backend API (set via `PUBLIC_API_BASE_URL` env variable).
 * @property timeout - Default request timeout in milliseconds.
 * @property retry - Retry policy: max attempts, initial delay (ms), back-off multiplier, and retryable HTTP status codes.
 * @property headers - Default headers attached to every outgoing request.
 * @property debug - When `true`, enables verbose request/response logging (auto-enabled in DEV).
 */
export const apiConfig = {
	baseURL: PUBLIC_API_BASE_URL,

	timeout: 5000,

	retry: {
		attempts: 3,
		delay: 1000,
		backoff: 2,
		retryOn: [408, 429, 500, 502, 503, 504]
	},

	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
		'X-App-Version': __APP_VERSION__
	},

	debug: import.meta.env.DEV
} as const;

/**
 * Configuration for the booking-systems integration API client (`PUBLIC_BS_BASE_URL`).
 * Same timeouts, retry policy, and default headers as the main API; only the base URL differs.
 */
export const bsApiConfig = {
	baseURL: PUBLIC_BS_BASE_URL,

	timeout: apiConfig.timeout,

	retry: apiConfig.retry,

	headers: apiConfig.headers,

	debug: apiConfig.debug
} as const;
