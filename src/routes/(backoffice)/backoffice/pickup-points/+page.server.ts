/**
 * Server load function for the pickup points list page.
 * Parses URL filters, fetches paginated pickup points, and builds breadcrumbs.
 */
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { pickupPointsFiltersSchema } from './schemas/filters.schema';
import { PICKUP_POINT_REQUEST } from '$core/pickup-points/requests';
import type { PickupPointCriteria } from '$core/pickup-points/types';
import { ApiError } from '$core/_shared/errors';
import { buildPagination } from '$core/_shared/params';
import { parseFilters } from '$lib/utils/filters';
import { generateBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const filters = parseFilters(pickupPointsFiltersSchema, url.searchParams);
	const page = filters.page ?? 1;
	const pageSize = filters.pageSize ?? 10;

	try {
		const breadcrumbs = generateBreadcrumbs(url.pathname);

		const response = await PICKUP_POINT_REQUEST.findByCriteria(fetch, {
			skip: (page - 1) * pageSize,
			limit: pageSize,
			sort: filters.sort,
			order: filters.order,
			name: filters.q
		} as PickupPointCriteria);

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
