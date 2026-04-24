import type { PageServerLoad } from './$types';
import { destinationsEndpoints } from '$lib/api/marketplace/endpoints/destinations';
import { activitiesEndpoints } from '$lib/api/marketplace/endpoints/activities';
import { reviewsEndpoints } from '$lib/api/marketplace/endpoints/reviews';
import { handleApiError } from '$core/_shared/errors';
import mockActivitiesData from '$lib/fixtures/mock-activities-by-buendia-home.json';

export type ActivityCard = {
	id: string;
	image: string;
	name: string;
	slug: string;
	kind: string;
	infoList: Array<{ id: string; infoName: string }>;
	price?: string;
	discount?: string;
	rating?: number;
	opinions?: number;
	byBuendia?: boolean;
	isFreeTour?: boolean;
	isNew?: boolean;
	cancellation?: string;
};

// TODO: reemplazar con llamada a la API cuando esté lista
const mockActivities = mockActivitiesData as ActivityCard[];

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		const [destinationsResult, freeToursResult, paidToursResult, otherToursResult, reviewsResult] =
			await Promise.all([
				destinationsEndpoints.getAll(fetch, { pageSize: 5 }),
				activitiesEndpoints.getAll(fetch, { kind: 'FREE_TOUR', pageSize: 5 }),
				activitiesEndpoints.getAll(fetch, { kind: 'PAID_TOUR', pageSize: 5 }),
				activitiesEndpoints.getAll(fetch, { kind: 'OTHER', pageSize: 5 }),
				reviewsEndpoints.getByActivityId(fetch, '550e8400-e29b-41d4-a716-000000000001')
			]);

		return {
			destinations: destinationsResult.data,
			freeTours: freeToursResult.data,
			paidTours: paidToursResult.data,
			otherTours: otherToursResult.data,
			reviews: reviewsResult.data,
			activities: mockActivities
		};
	} catch (err) {
		throw handleApiError(err, 'los datos');
	}
};
