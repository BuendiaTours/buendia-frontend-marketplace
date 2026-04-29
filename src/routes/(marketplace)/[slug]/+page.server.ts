import type { PageServerLoad } from './$types';
import { destinationsEndpoints } from '$lib/api/endpoints/destinations';
import { categoriesEndpoints } from '$lib/api/endpoints/categories';
import { reviewsEndpoints } from '$lib/api/endpoints/reviews';
import { activityKindsEndpoints } from '$lib/api/endpoints/activityKinds';
import { handleApiError } from '$core/_shared/errors';
import { buildDestinationBreadcrumbs } from '$lib/utils/breadcrumbs';
import { parseFilters } from '$lib/utils/filters';
import { destinationActivitiesFiltersSchema } from './schemas/filters.schema';

export const load: PageServerLoad = async ({ params, url, fetch }) => {
	const { slug } = params;
	const filters = parseFilters(destinationActivitiesFiltersSchema, url.searchParams);
	const reviewsPage = Number(url.searchParams.get('reviewsPage')) || 4;

	try {
		const destination = await destinationsEndpoints.getBySlug(fetch, slug);

		const [activitiesResult, categoriesResult, reviewsResult, activityKinds] = await Promise.all([
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
			reviewsEndpoints.getByDestinationSlug(fetch, slug, reviewsPage),
			activityKindsEndpoints.getAll(fetch)
		]);

		return {
			destination,
			destinationActivities: activitiesResult.data,
			pagination: activitiesResult.pagination,
			categories: categoriesResult,
			reviews: reviewsResult.data,
			activityKinds,
			filters,
			breadcrumbs: buildDestinationBreadcrumbs(destination)
		};
	} catch (err) {
		throw handleApiError(err, 'el destino');
	}
};
