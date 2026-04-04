/**
 * Server load function for the analytics dashboard page.
 * Parses URL filters, applies defaults (last 30 days), and fetches KPI data.
 */
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { analyticsFiltersSchema } from './schemas/filters.schema';
import { ANALYTICS_REQUEST } from '$core/analytics/requests';
import { AnalyticsGranularity, SupplierSort, ActivitySort, SortOrder } from '$core/analytics/enums';
import { ApiError } from '$core/_shared/errors';
import { parseFilters } from '$lib/utils/filters';
import { generateBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';

function getDefaultDateFrom(): string {
	const d = new Date();
	d.setDate(d.getDate() - 30);
	return d.toISOString().split('T')[0];
}

function getDefaultDateTo(): string {
	return new Date().toISOString().split('T')[0];
}

export const load: PageServerLoad = async ({ fetch, url }) => {
	const filters = parseFilters(analyticsFiltersSchema, url.searchParams);

	const dateFrom = filters.dateFrom ?? getDefaultDateFrom();
	const dateTo = filters.dateTo ?? getDefaultDateTo();
	const granularity = filters.granularity ?? AnalyticsGranularity.WEEK;

	const apiFilters = {
		dateFrom,
		dateTo,
		granularity,
		activityKind: filters.activityKind,
		locationId: filters.locationId,
		comparePrevious: true
	};

	try {
		const breadcrumbs = generateBreadcrumbs(url.pathname);

		const [kpis, revenueTimeSeries, bookingsTimeSeries, topSuppliers, topActivities] =
			await Promise.all([
				ANALYTICS_REQUEST.getKpis(fetch, apiFilters),
				ANALYTICS_REQUEST.getRevenueTimeSeries(fetch, apiFilters),
				ANALYTICS_REQUEST.getBookingsTimeSeries(fetch, apiFilters),
				ANALYTICS_REQUEST.getTopSuppliers(fetch, {
					...apiFilters,
					sort: SupplierSort.BOOKINGS,
					order: SortOrder.DESC,
					limit: 10
				}),
				ANALYTICS_REQUEST.getTopActivities(fetch, {
					...apiFilters,
					sort: ActivitySort.BOOKINGS,
					order: SortOrder.DESC,
					limit: 10
				})
			]);

		return {
			kpis,
			revenueTimeSeries: revenueTimeSeries.data,
			bookingsTimeSeries: bookingsTimeSeries.data,
			topSuppliers: topSuppliers.data,
			suppliersSummary: topSuppliers.summary,
			topActivities: topActivities.data,
			filters: {
				...filters,
				dateFrom,
				dateTo,
				granularity
			},
			breadcrumbs
		};
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status || 500);
		}
		throw error(503);
	}
};
