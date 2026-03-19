/**
 * Server load for the stages tab.
 * Data comes from the parent layout — this exists to define the route.
 */
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { activity } = await parent();
	return {
		activity,
		stages: activity.stages ?? []
	};
};
