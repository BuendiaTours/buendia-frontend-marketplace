import type { PageServerLoad } from './$types';
import { destinationsEndpoints } from '$lib/api/endpoints/destinations';
import { activitiesEndpoints } from '$lib/api/endpoints/activities';
import { handleApiError } from '$core/_shared/errors';

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		// Fetch all data in parallel
		const [destinationsResult, freeToursResult, paidToursResult, otherToursResult] =
			await Promise.all([
				destinationsEndpoints.getAll(fetch, { pageSize: 5 }),
				activitiesEndpoints.getAll(fetch, { kind: 'FREE_TOUR', pageSize: 5 }),
				activitiesEndpoints.getAll(fetch, { kind: 'PAID_TOUR', pageSize: 5 }),
				activitiesEndpoints.getAll(fetch, { kind: 'OTHER', pageSize: 5 })
			]);

		return {
			destinations: destinationsResult.data,
			freeTours: freeToursResult.data,
			paidTours: paidToursResult.data,
			otherTours: otherToursResult.data
		};
	} catch (err) {
		throw handleApiError(err, 'los datos');
	}
};
