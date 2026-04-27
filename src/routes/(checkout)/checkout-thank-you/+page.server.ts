import type { PageServerLoad } from './$types';
import mockActivitiesData from '$lib/fixtures/mock-activities-by-buendia-home.json';
import type { ActivityCard } from '../../(marketplace)/+page.server';

const mockActivities = mockActivitiesData as ActivityCard[];

export const load: PageServerLoad = async () => {
	return {
		activities: mockActivities
	};
};
