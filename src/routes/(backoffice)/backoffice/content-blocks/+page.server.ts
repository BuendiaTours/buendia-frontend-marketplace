import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { contentBlocksFiltersSchema } from './schemas/filters.schema';
import { CONTENT_BLOCK_REQUEST } from '$core/content-blocks/requests';
import type { ContentBlockCriteria } from '$core/content-blocks/types';
import { ApiError } from '$core/_shared/errors';
import { buildPagination } from '$core/_shared/params';
import { parseFilters } from '$lib/utils/filters';
import { generateBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const filters = parseFilters(contentBlocksFiltersSchema, url.searchParams);

	try {
		const breadcrumbs = generateBreadcrumbs(url.pathname);

		const page = filters.page ?? 1;
		const pageSize = filters.pageSize ?? 10;

		const response = await CONTENT_BLOCK_REQUEST.findByCriteria(fetch, {
			page,
			pageSize,
			sort: filters.sort,
			order: filters.order,
			searchText: filters.q,
			kind: filters.kind
		} as ContentBlockCriteria);

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
