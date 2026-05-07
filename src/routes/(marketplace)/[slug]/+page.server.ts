import type { PageServerLoad } from './$types';
import { destinationsEndpoints } from '$lib/api/endpoints/destinations';
import { categoriesEndpoints } from '$lib/api/endpoints/categories';
import { activityKindsEndpoints } from '$lib/api/endpoints/activityKinds';
import { handleApiError } from '$core/_shared/errors';
import { parseFilters } from '$lib/utils/filters';
import { destinationActivitiesFiltersSchema } from './schemas/filters.schema';

export const load: PageServerLoad = async ({ params, url, fetch }) => {
	const { slug } = params;
	const filters = parseFilters(destinationActivitiesFiltersSchema, url.searchParams);

	try {
		const destination = await destinationsEndpoints.getBySlug(fetch, slug);

		const [activitiesResult, categoriesResult, activityKinds] = await Promise.all([
			destinationsEndpoints.getActivitiesById(fetch, destination.id, {
				page: filters.page,
				pageSize: filters.pageSize,
				kind: filters.kind,
				sort: filters.sort,
				order: filters.order,
				isFreeTour: filters.isFreeTour,
				kidsFreeTour: filters.kidsFreeTour,
				wheelchairAccessible: filters.wheelchairAccessible,
				breakfastIncluded: filters.breakfastIncluded,
				audioGuideAvailable: filters.audioGuideAvailable,
				photographyAllowed: filters.photographyAllowed,
				smallGroup: filters.smallGroup
			}),
			categoriesEndpoints.getAll(fetch),
			activityKindsEndpoints.getAll(fetch)
		]);

		return {
			destination,
			destinationActivities: activitiesResult.data,
			pagination: activitiesResult.pagination,
			categories: categoriesResult,
			activityKinds,
			filters,
			breadcrumbs: []
		};
	} catch (err) {
		throw handleApiError(err, 'el destino');
	}
};
