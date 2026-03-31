/**
 * Server load for the locations tab.
 * Includes locations, attractions, and itinerary stages from the parent layout.
 */
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { activity } = await parent();
	return {
		locations: activity.locations ?? [],
		attractions: activity.attractions ?? [],
		stages: activity.stages ?? []
	};
};
