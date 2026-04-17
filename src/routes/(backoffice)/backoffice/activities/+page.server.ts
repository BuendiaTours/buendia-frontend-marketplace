/**
 * Server load function for the activities list page.
 * Parses URL filters, fetches paginated activities from the API, and builds breadcrumbs.
 */
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { activitiesFiltersSchema } from './schemas/filters.schema';
import { ACTIVITY_REQUEST } from '$core/activities/requests';
import type { ActivityCriteria } from '$core/activities/types';
import { ActivityKind } from '$core/activities/enums';
import { ApiError } from '$core/_shared/errors';
import { buildPagination } from '$core/_shared/params';
import { parseFilters } from '$lib/utils/filters';
import { generateBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const filters = parseFilters(activitiesFiltersSchema, url.searchParams);

	try {
		const breadcrumbs = generateBreadcrumbs(url.pathname);

		const page = filters.page ?? 1;
		const pageSize = filters.pageSize ?? 10;

		const response = await ACTIVITY_REQUEST.findByCriteria(fetch, {
			page,
			pageSize,
			sort: filters.sort,
			order: filters.order,
			search_text: filters.q,
			kind: ActivityKind.PAID_TOUR,
			status: filters.status
		} as ActivityCriteria);

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
