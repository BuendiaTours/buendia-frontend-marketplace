import { PUBLIC_API_BASE_URL } from '$env/static/public';

export async function apiFetch(fetchFn: typeof fetch, path: string, options?: RequestInit) {
	const url = `${PUBLIC_API_BASE_URL}${path}`;

	const res = await fetchFn(url, {
		headers: {
			'Content-Type': 'application/json',
			...(options?.headers ?? {})
		},
		...options
	});

	if (!res.ok) {
		throw new Error(`API error ${res.status}`);
	}

	return res;
}
