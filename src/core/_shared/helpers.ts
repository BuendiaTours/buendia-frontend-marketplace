import { apiClient } from '$core/_shared/client';
import { buildEndpointUrl, toSkipLimit } from '$core/_shared/params';

export async function get<T>(fetchFn: typeof fetch, path: string): Promise<T> {
	const response = await apiClient.request<T>(fetchFn, path, { method: 'GET' });
	return response.data;
}

export async function getWithParams<T>(
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

export async function post<T = void>(
	fetchFn: typeof fetch,
	path: string,
	body: unknown
): Promise<T> {
	const response = await apiClient.request<T>(fetchFn, path, {
		method: 'POST',
		body: JSON.stringify(body)
	});
	return response.data;
}

export async function patch<T = void>(
	fetchFn: typeof fetch,
	path: string,
	body: unknown
): Promise<T> {
	const response = await apiClient.request<T>(fetchFn, path, {
		method: 'PATCH',
		body: JSON.stringify(body)
	});
	return response.data;
}

export async function put<T = void>(
	fetchFn: typeof fetch,
	path: string,
	body: unknown
): Promise<T> {
	const response = await apiClient.request<T>(fetchFn, path, {
		method: 'PUT',
		body: JSON.stringify(body)
	});
	return response.data;
}

export async function del(fetchFn: typeof fetch, path: string): Promise<void> {
	await apiClient.request<void>(fetchFn, path, { method: 'DELETE' });
}
