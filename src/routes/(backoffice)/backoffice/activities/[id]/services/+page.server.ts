/**
 * Server load for the services tab.
 * Includes meals and addons from the parent layout.
 */
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { activity, addons } = await parent();
	return {
		meals: activity.meals ?? [],
		addons: addons ?? []
	};
};
