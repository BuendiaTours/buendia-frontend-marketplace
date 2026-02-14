import type { PageServerLoad } from './$types';
import { destinationsEndpoints } from '$lib/api/marketplace/endpoints/destinations';
import { activitiesEndpoints } from '$lib/api/marketplace/endpoints/activities';
import { categoriesEndpoints } from '$lib/api/marketplace/endpoints/categories';
import { buildPagination } from '$api-shared/params';
import { handleApiError } from '$api-shared/errors';

export const load: PageServerLoad = async ({ params, url, fetch }) => {
	const { slug } = params;
	const page = Number(url.searchParams.get('page')) || 1;
	const pageSize = Number(url.searchParams.get('pageSize')) || 10;

	try {
		// Fetch destination, activities and categories in parallel
		const [destination, activitiesResult, categoriesResult] = await Promise.all([
			destinationsEndpoints.getBySlug(fetch, slug),
			activitiesEndpoints.getAll(fetch, {
				destination: slug,
				page,
				pageSize
			}),
			categoriesEndpoints.getAll(fetch)
		]);

		return {
			destination,
			activities: activitiesResult.data,
			pagination: buildPagination(activitiesResult.total, page, pageSize),
			categories: categoriesResult
		};
	} catch (err) {
		throw handleApiError(err, 'el destino');
	}
};
