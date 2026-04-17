/**
 * Layout server load for activity sub-routes.
 * Fetches the full activity by ID and its addons so child pages can access them via parent data.
 * When `?from=<freeTourId>` is present, also loads the source free tour aggregation so
 * child pages can render contextual breadcrumbs and back navigation.
 */
import { ACTIVITY_REQUEST } from '$core/activities/requests';
import { ACTIVITY_ADDON_REQUEST } from '$core/activity-addons/requests';
import { ACTIVITY_OPTION_REQUEST } from '$core/activity-options/requests';
import { FREE_TOUR_REQUEST } from '$core/free-tours/requests';
import { ApiError } from '$core/_shared/errors';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch, params, url }) => {
	const fromFreeTourId = url.searchParams.get('from');

	try {
		const [activity, addonsResponse, options] = await Promise.all([
			ACTIVITY_REQUEST.findById(fetch, params.id),
			ACTIVITY_ADDON_REQUEST.findByCriteria(fetch, { activityId: params.id }),
			ACTIVITY_OPTION_REQUEST.findByActivityId(fetch, params.id)
		]);

		let fromFreeTour: { id: string; title: string } | null = null;
		if (fromFreeTourId) {
			try {
				const freeTour = await FREE_TOUR_REQUEST.findById(fetch, fromFreeTourId);
				fromFreeTour = { id: freeTour.id, title: freeTour.title };
			} catch {
				fromFreeTour = null;
			}
		}

		return {
			activity,
			addons: addonsResponse.data ?? [],
			options: options ?? [],
			fromFreeTour
		};
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status || 500);
		}
		throw error(503);
	}
};
