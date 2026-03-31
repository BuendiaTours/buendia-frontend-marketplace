/**
 * Server load for the option Booking System tab.
 * The integration status and supplier option code live on the option projection itself.
 */
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { activity, option } = await parent();
	return { activity, option };
};
