/**
 * Server load for the locations tab.
 * Includes locations, attractions, and itinerary stages from the parent layout.
 * Supports auto-add when returning from location/attraction creation.
 */
import { LOCATION_REQUEST } from '$core/locations/requests';
import { ATTRACTION_REQUEST } from '$core/attractions/requests';
import type { Location } from '$core/locations/types';
import type { Attraction } from '$core/attractions/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, fetch, url }) => {
	const { activity } = await parent();

	const addLocationId = url.searchParams.get('addLocationId');
	let pendingLocation: Location | null = null;

	if (addLocationId) {
		try {
			pendingLocation = await LOCATION_REQUEST.findById(fetch, addLocationId);
		} catch {
			// Not found yet (CQRS) — silently ignore
		}
	}

	const addAttractionId = url.searchParams.get('addAttractionId');
	let pendingAttraction: Attraction | null = null;

	if (addAttractionId) {
		try {
			pendingAttraction = await ATTRACTION_REQUEST.findById(fetch, addAttractionId);
		} catch {
			// Not found yet (CQRS) — silently ignore
		}
	}

	return {
		locations: activity.locations ?? [],
		attractions: activity.attractions ?? [],
		stages: activity.stages ?? [],
		pendingLocation,
		pendingAttraction
	};
};
