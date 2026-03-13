import type { PageServerLoad } from './$types';
import { locationsEndpoints } from '$lib/api/marketplace/endpoints/locations';
import { activitiesEndpoints } from '$lib/api/marketplace/endpoints/activities';
import { handleApiError } from '$core/_shared/errors';

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		// Fetch all data in parallel
		const [locationsResult, freeToursResult, paidToursResult, otherToursResult] = await Promise.all(
			[
				locationsEndpoints.getAll(fetch, { pageSize: 5 }),
				activitiesEndpoints.getAll(fetch, { kind: 'FREE_TOUR', pageSize: 5 }),
				activitiesEndpoints.getAll(fetch, { kind: 'PAID_TOUR', pageSize: 5 }),
				activitiesEndpoints.getAll(fetch, { kind: 'OTHER', pageSize: 5 })
			]
		);

		return {
			locations: locationsResult.data,
			freeTours: freeToursResult.data,
			paidTours: paidToursResult.data,
			otherTours: otherToursResult.data
		};
	} catch (err) {
		throw handleApiError(err, 'los datos');
	}
};
