/**
 * Server load for the addons tab.
 * Addons come from the parent layout — this exists to define the route.
 */
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { activity, addons } = await parent();
	return {
		activity,
		addons: addons ?? []
	};
};
