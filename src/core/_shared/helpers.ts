/**
 * @module _shared/helpers
 * @description Convenience wrappers around {@link ApiClient.request} for common HTTP verbs.
 * Every resource module (activities, attractions, etc.) uses these helpers instead of
 * calling the client directly, keeping request code concise and consistent.
 * Booking-systems integration calls use {@link bookingSystemsApi} the same way.
 */

import { apiClient, bsApiClient, type ApiClient } from '$core/_shared/client';
import { buildEndpointUrl, toSkipLimit } from '$core/_shared/params';

function createApiHelpers(client: ApiClient) {
	async function get<T>(fetchFn: typeof fetch, path: string): Promise<T> {
		const response = await client.request<T>(fetchFn, path, { method: 'GET' });
		return response.data;
	}

	async function getWithParams<T>(
		fetchFn: typeof fetch,
		path: string,
		params?: Record<string, unknown>
	): Promise<T> {
		const url = buildEndpointUrl(
			path,
			toSkipLimit(params) as Record<string, string | number | boolean | undefined>
		);
		return get<T>(fetchFn, url);
	}

	async function post<T = void>(fetchFn: typeof fetch, path: string, body: unknown): Promise<T> {
		const response = await client.request<T>(fetchFn, path, {
			method: 'POST',
			body: JSON.stringify(body)
		});
		return response.data;
	}

	async function patch<T = void>(fetchFn: typeof fetch, path: string, body: unknown): Promise<T> {
		const response = await client.request<T>(fetchFn, path, {
			method: 'PATCH',
			body: JSON.stringify(body)
		});
		return response.data;
	}

	async function put<T = void>(fetchFn: typeof fetch, path: string, body: unknown): Promise<T> {
		const response = await client.request<T>(fetchFn, path, {
			method: 'PUT',
			body: JSON.stringify(body)
		});
		return response.data;
	}

	async function del(fetchFn: typeof fetch, path: string): Promise<void> {
		await client.request<void>(fetchFn, path, { method: 'DELETE' });
	}

	return { get, getWithParams, post, patch, put, del };
}

const mainApi = createApiHelpers(apiClient);

/**
 * Performs a GET request and returns the parsed response body.
 * @template T - Expected response type.
 * @param fetchFn - SvelteKit-provided `fetch`.
 * @param path - API path relative to the base URL.
 */
export async function get<T>(fetchFn: typeof fetch, path: string): Promise<T> {
	return mainApi.get<T>(fetchFn, path);
}

/**
 * Performs a GET request with query parameters.
 * Automatically converts `page`/`pageSize` to `skip`/`limit` via {@link toSkipLimit}.
 * @template T - Expected response type.
 * @param fetchFn - SvelteKit-provided `fetch`.
 * @param path - API path relative to the base URL.
 * @param params - Key-value pairs serialised as URL search parameters.
 */
export async function getWithParams<T>(
	fetchFn: typeof fetch,
	path: string,
	params?: Record<string, unknown>
): Promise<T> {
	return mainApi.getWithParams<T>(fetchFn, path, params);
}

/**
 * Performs a POST request with a JSON body.
 * @template T - Expected response type (defaults to `void`).
 * @param fetchFn - SvelteKit-provided `fetch`.
 * @param path - API path relative to the base URL.
 * @param body - Request payload (will be JSON-stringified).
 */
export async function post<T = void>(
	fetchFn: typeof fetch,
	path: string,
	body: unknown
): Promise<T> {
	return mainApi.post<T>(fetchFn, path, body);
}

/**
 * Performs a PATCH request with a JSON body (partial update).
 * @template T - Expected response type (defaults to `void`).
 * @param fetchFn - SvelteKit-provided `fetch`.
 * @param path - API path relative to the base URL.
 * @param body - Partial payload (will be JSON-stringified).
 */
export async function patch<T = void>(
	fetchFn: typeof fetch,
	path: string,
	body: unknown
): Promise<T> {
	return mainApi.patch<T>(fetchFn, path, body);
}

/**
 * Performs a PUT request with a JSON body (full replacement).
 * @template T - Expected response type (defaults to `void`).
 * @param fetchFn - SvelteKit-provided `fetch`.
 * @param path - API path relative to the base URL.
 * @param body - Full payload (will be JSON-stringified).
 */
export async function put<T = void>(
	fetchFn: typeof fetch,
	path: string,
	body: unknown
): Promise<T> {
	return mainApi.put<T>(fetchFn, path, body);
}

/**
 * Performs a DELETE request. Returns nothing on success.
 * @param fetchFn - SvelteKit-provided `fetch`.
 * @param path - API path relative to the base URL.
 */
export async function del(fetchFn: typeof fetch, path: string): Promise<void> {
	return mainApi.del(fetchFn, path);
}

/**
 * Same helpers as the root exports (`get`, `post`, …) but targeting {@link bsApiClient}
 * (`PUBLIC_BS_BASE_URL`).
 */
export const bookingSystemsApi = createApiHelpers(bsApiClient);
