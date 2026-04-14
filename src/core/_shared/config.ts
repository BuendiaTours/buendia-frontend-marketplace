/**
 * @module _shared/config
 * @description Global API configuration consumed by {@link ApiClient}.
 * All values are read-only at runtime (`as const`).
 */

import { PUBLIC_API_BASE_URL, PUBLIC_BOOKINGS_API_BASE_URL } from '$env/static/public';

declare const __APP_VERSION__: string;

const sharedConfig = {
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
};

/** Config for the content/catalogue API (PUBLIC_API_BASE_URL). */
export const apiConfig = {
	baseURL: PUBLIC_API_BASE_URL,
	...sharedConfig
} as const;

/** Config for the bookings/orders API (PUBLIC_BOOKINGS_API_BASE_URL). */
export const bookingsApiConfig = {
	baseURL: PUBLIC_BOOKINGS_API_BASE_URL,
	...sharedConfig
} as const;
