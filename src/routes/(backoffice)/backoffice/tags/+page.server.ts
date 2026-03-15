/**
 * Server load function for the tags list page.
 * Parses URL filters, fetches paginated tags from the API, and builds breadcrumbs.
 */
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { tagsFiltersSchema } from './schemas/filters.schema';
import { TAG_REQUEST } from '$core/tags/requests';
import type { TagCriteria } from '$core/tags/types';
import { ApiError } from '$core/_shared/errors';
import { buildPagination } from '$core/_shared/params';
import { parseFilters } from '$lib/utils/filters';
import { generateBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const filters = parseFilters(tagsFiltersSchema, url.searchParams);

	try {
		const breadcrumbs = generateBreadcrumbs(url.pathname);

		const response = await TAG_REQUEST.findByCriteria(fetch, {
			page: filters.page,
			pageSize: filters.pageSize,
			sort: filters.sort,
			order: filters.order,
			name: filters.q
		} as TagCriteria);

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
