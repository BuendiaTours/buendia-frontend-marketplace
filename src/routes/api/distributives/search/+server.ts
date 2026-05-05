import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { bookingsApiClient } from '$core/_shared/client';
import { API_ENDPOINTS } from '$core/_shared/endpoints.config';
import { buildEndpointUrl } from '$core/_shared/params';
import type { DistributiveSearchResponse } from '$core/distributives/types';

export const GET: RequestHandler = async ({ url, fetch }) => {
	const query = url.searchParams.get('query') ?? '';
	const limit = Math.min(Number(url.searchParams.get('limit') ?? 8), 8);

	const path = buildEndpointUrl(API_ENDPOINTS.distributives.search.path(), {
		query,
		skip: 0,
		limit
	});

	const response = await bookingsApiClient.request<DistributiveSearchResponse>(fetch, path, {
		method: 'GET'
	});

	return json(response.data);
};
