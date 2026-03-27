import type { PageServerLoad } from './$types';
import { destinationsEndpoints } from '$lib/api/marketplace/endpoints/destinations';
import { reviewsEndpoints } from '$lib/api/marketplace/endpoints/reviews';
import { handleApiError } from '$core/_shared/errors';
import { buildDestinationBreadcrumbs } from '$lib/utils/breadcrumbsMarketplace';

export const load: PageServerLoad = async ({ params, url, fetch }) => {
	const { slug } = params;
	const page = Number(url.searchParams.get('page')) || 1;
	const pageSize = Number(url.searchParams.get('pageSize')) || 10;

	try {
		const destination = await destinationsEndpoints.getBySlug(fetch, slug);

		const [activitiesResult, reviewsResult] = await Promise.all([
			destinationsEndpoints.getActivities(fetch, destination.id, { page, pageSize }),
			reviewsEndpoints.getByDestinationSlug(fetch, slug, 3)
		]);

		return {
			destination,
			activities: activitiesResult.data,
			pagination: activitiesResult.pagination,
			reviews: reviewsResult.data,
			breadcrumbs: buildDestinationBreadcrumbs(destination)
		};
	} catch (err) {
		throw handleApiError(err, 'el destino');
	}
};
