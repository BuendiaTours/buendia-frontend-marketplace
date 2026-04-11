/**
 * Server load function for the FAQs list page.
 * Parses URL filters, fetches paginated FAQs from the API, and builds breadcrumbs.
 */
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { faqsFiltersSchema } from './schemas/filters.schema';
import { FAQ_REQUEST } from '$core/faqs/requests';
import type { FaqCriteria } from '$core/faqs/types';
import { ApiError } from '$core/_shared/errors';
import { buildPagination } from '$core/_shared/params';
import { parseFilters } from '$lib/utils/filters';
import { generateBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const filters = parseFilters(faqsFiltersSchema, url.searchParams);

	const breadcrumbs = generateBreadcrumbs(url.pathname);

	try {
		const response = await FAQ_REQUEST.findByCriteria(fetch, {
			page: filters.page,
			pageSize: filters.pageSize,
			sort: filters.sort,
			order: filters.order,
			status: filters.status,
			scope: 'GLOBAL'
		} as FaqCriteria);

		return {
			items: response.data || [],
			pagination: buildPagination(response.total, filters.page, filters.pageSize),
			filters,
			sort: filters.sort && filters.order ? { field: filters.sort, order: filters.order } : null,
			breadcrumbs
		};
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) {
			// FAQ endpoint not deployed yet — return empty state
			return {
				items: [],
				pagination: buildPagination(0, filters.page, filters.pageSize),
				filters,
				sort: filters.sort && filters.order ? { field: filters.sort, order: filters.order } : null,
				breadcrumbs
			};
		}
		if (err instanceof ApiError) {
			throw error(err.status || 500);
		}
		throw error(503);
	}
};
