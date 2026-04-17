/**
 * Server load function for the distributives list page.
 * Parses URL filters, fetches paginated distributives from the API, and builds breadcrumbs.
 */
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { distributivesFiltersSchema } from './schemas/filters.schema';
import { DISTRIBUTIVE_REQUEST } from '$core/distributives/requests';
import type { DistributiveCriteria } from '$core/distributives/types';
import { ApiError } from '$core/_shared/errors';
import { buildPagination } from '$core/_shared/params';
import { parseFilters } from '$lib/utils/filters';
import { generateBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const filters = parseFilters(distributivesFiltersSchema, url.searchParams);

	try {
		const breadcrumbs = generateBreadcrumbs(url.pathname);

		const currentPage = filters.page ?? 1;
		const currentPageSize = filters.pageSize ?? 10;

		const response = await DISTRIBUTIVE_REQUEST.findByCriteria(fetch, {
			skip: (currentPage - 1) * currentPageSize,
			limit: currentPageSize,
			sort: filters.sort ? 'NAME' : undefined,
			order: filters.order,
			searchText: filters.q,
			status: filters.status
		} as DistributiveCriteria);

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
