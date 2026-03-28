/**
 * Server load function for the multimedia list page.
 * Parses URL filters, fetches paginated media from the API, and builds breadcrumbs.
 */
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { multimediaFiltersSchema } from './schemas/filters.schema';
import { MEDIA_REQUEST } from '$core/multimedia/requests';
import type { MediaCriteria } from '$core/multimedia/types';
import { ApiError } from '$core/_shared/errors';
import { buildPagination } from '$core/_shared/params';
import { parseFilters } from '$lib/utils/filters';
import { generateBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const filters = parseFilters(multimediaFiltersSchema, url.searchParams);

	try {
		const breadcrumbs = generateBreadcrumbs(url.pathname);

		const response = await MEDIA_REQUEST.findByCriteria(fetch, {
			page: filters.page,
			pageSize: filters.pageSize,
			sort: filters.sort,
			order: filters.order,
			search_text: filters.q,
			status: filters.status,
			kind: filters.kind
		} as MediaCriteria);

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
