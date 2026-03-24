/**
 * Server load for the option Booking System tab.
 * Fetches the indexation data from the booking systems API using the option ID.
 */
import type { PageServerLoad } from './$types';
import { ACTIVITY_REQUEST } from '$core/activities/requests';

export const load: PageServerLoad = async ({ fetch, parent }) => {
	const { activity, option } = await parent();

	let indexation = null;
	try {
		indexation = await ACTIVITY_REQUEST.fetchIndexationActivity(fetch, option.id);
	} catch {
		// If the fetch fails, we'll show the empty form
	}

	return { activity, option, indexation };
};
