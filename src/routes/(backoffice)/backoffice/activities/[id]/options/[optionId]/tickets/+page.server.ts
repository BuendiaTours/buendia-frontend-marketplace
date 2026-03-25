/**
 * Server load for the option tickets tab.
 * Option data (including individualTickets and groupTickets) comes from the parent layout.
 */
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { activity, option } = await parent();
	return { activity, option };
};
