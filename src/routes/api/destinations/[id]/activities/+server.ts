import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { destinationsEndpoints } from '$lib/api/marketplace/endpoints/destinations';

const BOOL_FILTER_KEYS = [
	'kidsFreeTour',
	'wheelchairAccessible',
	'breakfastIncluded',
	'audioGuideAvailable',
	'photographyAllowed',
	'smallGroup'
] as const;

export const GET: RequestHandler = async ({ params, url, fetch }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	const pageSize = Number(url.searchParams.get('pageSize')) || 12;
	const kind = url.searchParams.get('kind') ?? undefined;
	const boolParams = Object.fromEntries(
		BOOL_FILTER_KEYS.flatMap((k) =>
			url.searchParams.has(k) ? [[k, url.searchParams.get(k) === '1']] : []
		)
	);
	const result = await destinationsEndpoints.getActivitiesById(fetch, params.id, {
		page,
		pageSize,
		kind,
		...boolParams
	});
	return json(result);
};
