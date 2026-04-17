/**
 * Server load for the option pickup tab.
 * Option data (including pickupPlaces) comes from the parent layout.
 * Reads `addPickupPointId` from URL when returning from pickup point creation.
 * FREE_TOUR activities don't have pickup points — redirect to the option edit.
 */
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { PICKUP_POINT_REQUEST } from '$core/pickup-points/requests';
import { ActivityKind } from '$core/activities/enums';
import { ACTIVITY_ROUTES } from '$lib/config/routes/backoffice/activities';

export const load: PageServerLoad = async ({ fetch, parent, url }) => {
	const { activity, option } = await parent();

	if (activity.kind === ActivityKind.FREE_TOUR) {
		throw redirect(303, ACTIVITY_ROUTES.optionEdit(activity.id, option.id));
	}

	const addPickupPointId = url.searchParams.get('addPickupPointId');
	let pendingPickupPoint = null;

	if (addPickupPointId) {
		try {
			pendingPickupPoint = await PICKUP_POINT_REQUEST.findById(fetch, addPickupPointId);
		} catch {
			// If the pickup point can't be fetched, ignore
		}
	}

	return { activity, option, pendingPickupPoint };
};
