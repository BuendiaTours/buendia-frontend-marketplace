import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { availabilityOptionsEndpoints } from '$lib/api/marketplace/endpoints/availabilityOptions';

export const GET: RequestHandler = async ({ fetch, url }) => {
	const activityId = url.searchParams.get('activityId');
	if (!activityId) error(400, 'activityId query param is required');

	const fromDate = url.searchParams.get('fromDate') ?? undefined;
	const result = await availabilityOptionsEndpoints.getByActivityId(fetch, activityId, fromDate);
	return json(result);
};
