import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { destinationsEndpoints } from '$lib/api/marketplace/endpoints/destinations';

export const GET: RequestHandler = async ({ params, url, fetch }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	const pageSize = Number(url.searchParams.get('pageSize')) || 12;
	const kind = url.searchParams.get('kind') ?? undefined;
	const result = await destinationsEndpoints.getActivitiesById(fetch, params.id, {
		page,
		pageSize,
		kind
	});
	return json(result);
};
