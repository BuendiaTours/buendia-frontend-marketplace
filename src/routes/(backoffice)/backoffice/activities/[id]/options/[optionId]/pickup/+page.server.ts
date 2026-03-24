/**
 * Server load for the option pickup tab.
 * Option data (including pickupPlaces) comes from the parent layout.
 * Reads `addPickupPointId` from URL when returning from pickup point creation.
 */
import type { PageServerLoad } from './$types';
import { PICKUP_POINT_REQUEST } from '$core/pickup-points/requests';

export const load: PageServerLoad = async ({ fetch, parent, url }) => {
	const { activity, option } = await parent();

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
