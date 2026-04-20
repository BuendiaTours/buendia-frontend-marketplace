import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { activityOptionsEndpoints } from '$lib/api/marketplace/endpoints/activityOptions';

export const GET: RequestHandler = async ({ params, fetch }) => {
	const result = await activityOptionsEndpoints.getByActivityId(fetch, params.activityId);
	return json(result);
};
