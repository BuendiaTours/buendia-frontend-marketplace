/**
 * Server load function for the locations list page.
 * Parses URL filters, fetches paginated locations from the API, and builds breadcrumbs.
 */
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { locationsFiltersSchema } from './schemas/filters.schema';
import { LOCATION_REQUEST } from '$core/locations/requests';
import type { LocationCriteria } from '$core/locations/types';
import { ApiError } from '$core/_shared/errors';
import { buildPagination } from '$core/_shared/params';
import { parseFilters } from '$lib/utils/filters';
import { generateBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const filters = parseFilters(locationsFiltersSchema, url.searchParams);
	const page = filters.page ?? 1;
	const pageSize = filters.pageSize ?? 10;

	try {
		const breadcrumbs = generateBreadcrumbs(url.pathname);

		const response = await LOCATION_REQUEST.findByCriteria(fetch, {
			page,
			pageSize,
			sort: filters.sort,
			order: filters.order,
			search_text: filters.q,
			kind: filters.kind
		} as LocationCriteria);

		return {
			items: response.data || [],
			pagination: buildPagination(response.total, page, pageSize),
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
