/**
 * Server load function for the free tours list page.
 * Parses URL filters, fetches paginated free tours from the API, and builds breadcrumbs.
 */
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { freeToursFiltersSchema } from './schemas/filters.schema';
import { FREE_TOUR_REQUEST } from '$core/free-tours/requests';
import type { FreeTourCriteria } from '$core/free-tours/types';
import { ApiError } from '$core/_shared/errors';
import { buildPagination } from '$core/_shared/params';
import { parseFilters } from '$lib/utils/filters';
import { generateBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const filters = parseFilters(freeToursFiltersSchema, url.searchParams);

	try {
		const breadcrumbs = generateBreadcrumbs(url.pathname);

		const currentPage = filters.page ?? 1;
		const currentPageSize = filters.pageSize ?? 10;

		const response = await FREE_TOUR_REQUEST.findByCriteria(fetch, {
			skip: (currentPage - 1) * currentPageSize,
			limit: currentPageSize,
			sort: filters.sort ?? undefined,
			order: filters.order,
			searchText: filters.q,
			status: filters.status
		} as FreeTourCriteria);

		return {
			items: response.data || [],
			pagination: buildPagination(response.total, currentPage, currentPageSize),
			filters,
			sort: filters.sort && filters.order ? { field: filters.sort, order: filters.order } : null,
			breadcrumbs
		};
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status || 500);
		}
		throw error(503);
	}
};
