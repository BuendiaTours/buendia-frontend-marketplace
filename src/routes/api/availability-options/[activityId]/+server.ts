import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { availabilityOptionsEndpoints } from '$lib/api/marketplace/endpoints/availabilityOptions';

export const GET: RequestHandler = async ({ params, fetch }) => {
	const result = await availabilityOptionsEndpoints.getByActivityId(fetch, params.activityId);
	return json(result);
};
