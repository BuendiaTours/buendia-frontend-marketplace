/**
 * Server load for the meals tab.
 * Data comes from the parent layout — this exists to define the route.
 */
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { activity } = await parent();
	return {
		meals: activity.meals ?? []
	};
};
