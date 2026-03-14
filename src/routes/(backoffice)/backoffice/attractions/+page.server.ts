/**
 * Server load function for the attractions list page.
 * Parses URL filters, fetches paginated attractions from the API, and builds breadcrumbs.
 */
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { attractionsFiltersSchema } from './schemas/filters.schema';
import { ATTRACTION_REQUEST } from '$core/attractions/requests';
import type { AttractionCriteria } from '$core/attractions/types';
import { ApiError } from '$core/_shared/errors';
import { buildPagination } from '$core/_shared/params';
import { parseFilters } from '$lib/utils/filters';
import { generateBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const filters = parseFilters(attractionsFiltersSchema, url.searchParams);

	try {
		const breadcrumbs = generateBreadcrumbs(url.pathname);

		const response = await ATTRACTION_REQUEST.findByCriteria(fetch, {
			page: filters.page,
			pageSize: filters.pageSize,
			sort: filters.sort,
			order: filters.order,
			query: filters.q,
			status: filters.status
		} as AttractionCriteria);

		return {
			items: response.data || [],
			pagination: buildPagination(response.total, filters.page, filters.pageSize),
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
