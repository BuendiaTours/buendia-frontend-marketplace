/**
 * Server load for the options tab.
 * Options come from the parent layout — this exists to define the route.
 */
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { activity, options } = await parent();
	return {
		activity,
		options: options ?? []
	};
};
