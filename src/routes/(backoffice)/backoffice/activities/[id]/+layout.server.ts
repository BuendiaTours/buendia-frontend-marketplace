/**
 * Layout server load for activity sub-routes.
 * Fetches the full activity by ID and its addons so child pages can access them via parent data.
 */
import { ACTIVITY_REQUEST } from '$core/activities/requests';
import { ACTIVITY_ADDON_REQUEST } from '$core/activity-addons/requests';
import { ApiError } from '$core/_shared/errors';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch, params }) => {
	try {
		const [activity, addonsResponse] = await Promise.all([
			ACTIVITY_REQUEST.findById(fetch, params.id),
			ACTIVITY_ADDON_REQUEST.findByCriteria(fetch, { activityId: params.id })
		]);
		return { activity, addons: addonsResponse.data ?? [] };
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status || 500);
		}
		throw error(503);
	}
};
