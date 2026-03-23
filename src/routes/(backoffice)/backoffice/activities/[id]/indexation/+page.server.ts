/**
 * Server load for the booking system tab.
 * Fetches the activity indexation from the booking systems API.
 */
import type { PageServerLoad } from './$types';
import { ACTIVITY_REQUEST } from '$core/activities/requests';

export const load: PageServerLoad = async ({ fetch, parent }) => {
	const { activity } = await parent();

	let indexation = null;
	try {
		indexation = await ACTIVITY_REQUEST.fetchIndexationActivity(fetch, activity.id);
	} catch {
		// If the fetch fails, we'll show the empty form
	}

	return { activity, indexation };
};
