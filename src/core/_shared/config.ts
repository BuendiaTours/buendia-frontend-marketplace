import { PUBLIC_API_BASE_URL } from '$env/static/public';

declare const __APP_VERSION__: string;

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
