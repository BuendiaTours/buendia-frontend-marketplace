import type { PageServerLoad } from './$types';
import { destinationsEndpoints } from '$lib/api/marketplace/endpoints/destinations';
import { activitiesEndpoints } from '$lib/api/marketplace/endpoints/activities';
import { categoriesEndpoints } from '$lib/api/marketplace/endpoints/categories';
import { reviewsEndpoints } from '$lib/api/marketplace/endpoints/reviews';
import { activityKindsEndpoints } from '$lib/api/marketplace/endpoints/activityKinds';
import { buildPagination } from '$core/_shared/params';
import { handleApiError } from '$core/_shared/errors';
import { buildDestinationBreadcrumbs } from '$lib/utils/breadcrumbsMarketplace';

export const load: PageServerLoad = async ({ params, url, fetch }) => {
	const { slug } = params;
	const page = Number(url.searchParams.get('page')) || 1;
	const pageSize = Number(url.searchParams.get('pageSize')) || 10;
	const reviewsPage = Number(url.searchParams.get('reviewsPage')) || 3;
	const kind = url.searchParams.get('kind') || undefined;

	try {
		const [destination, activitiesResult, categoriesResult, reviewsResult, activityKinds] =
			await Promise.all([
				destinationsEndpoints.getBySlug(fetch, slug),
				activitiesEndpoints.getAll(fetch, {
					destination: slug,
					page,
					pageSize,
					kind
				}),
				categoriesEndpoints.getAll(fetch),
				reviewsEndpoints.getByDestinationSlug(fetch, slug, reviewsPage),
				activityKindsEndpoints.getAll(fetch)
			]);

		return {
			destination,
			activities: activitiesResult.data,
			pagination: buildPagination(activitiesResult.total, page, pageSize),
			categories: categoriesResult,
			reviews: reviewsResult.data,
			activityKinds,
			breadcrumbs: buildDestinationBreadcrumbs(destination)
		};
	} catch (err) {
		throw handleApiError(err, 'el destino');
	}
};
