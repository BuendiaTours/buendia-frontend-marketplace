import type { PageServerLoad } from './$types';
import { locationsEndpoints } from '$lib/api/marketplace/endpoints/locations';
import { activitiesEndpoints } from '$lib/api/marketplace/endpoints/activities';
import { categoriesEndpoints } from '$lib/api/marketplace/endpoints/categories';
import { reviewsEndpoints } from '$lib/api/marketplace/endpoints/reviews';
import { buildPagination } from '$core/_shared/params';
import { handleApiError } from '$core/_shared/errors';
import { buildLocationBreadcrumbs } from '$lib/utils/breadcrumbsMarketplace';

export const load: PageServerLoad = async ({ params, url, fetch }) => {
	const { slug } = params;
	const page = Number(url.searchParams.get('page')) || 1;
	const pageSize = Number(url.searchParams.get('pageSize')) || 10;
	const reviewsPage = Number(url.searchParams.get('reviewsPage')) || 3;

	try {
		const [location, activitiesResult, categoriesResult] = await Promise.all([
			locationsEndpoints.getBySlug(fetch, slug),
			activitiesEndpoints.getAll(fetch, {
				location: slug,
				page,
				pageSize
			}),
			categoriesEndpoints.getAll(fetch),
			reviewsEndpoints.getByDestinationSlug(fetch, slug, reviewsPage)
		]);

		return {
			location,
			activities: activitiesResult.data,
			pagination: buildPagination(activitiesResult.total, page, pageSize),
			categories: categoriesResult,
			breadcrumbs: buildLocationBreadcrumbs(location)
		};
	} catch (err) {
		throw handleApiError(err, 'la ubicación');
	}
};
