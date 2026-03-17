/**
 * Layout server load for activity sub-routes.
 * Fetches the full activity by ID so child pages can access it via parent data.
 */
import { ACTIVITY_REQUEST } from '$core/activities/requests';
import { ApiError } from '$core/_shared/errors';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch, params }) => {
	try {
		const activity = await ACTIVITY_REQUEST.findById(fetch, params.id);
		return { activity };
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status || 500);
		}
		throw error(503);
	}
};
