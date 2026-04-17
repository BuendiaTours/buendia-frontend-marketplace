/**
 * Server load for the entries (activities) tab.
 * Loads available FREE_TOUR activities for the entry search.
 */
import { ACTIVITY_REQUEST } from '$core/activities/requests';
import { ActivityKind } from '$core/activities/enums';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, fetch }) => {
	const { freeTour } = await parent();

	const activitiesRes = await ACTIVITY_REQUEST.findByCriteria(fetch, {
		kind: ActivityKind.FREE_TOUR,
		limit: 200
	});

	return {
		entries: freeTour.entries ?? [],
		availableActivities: activitiesRes.data.map((a) => ({ id: a.id, title: a.title }))
	};
};
