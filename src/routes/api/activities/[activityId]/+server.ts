import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { activitiesEndpoints } from '$lib/api/endpoints/activities';

export const GET: RequestHandler = async ({ params, fetch }) => {
	const activity = await activitiesEndpoints.getById(fetch, params.activityId);
	return json(activity);
};
