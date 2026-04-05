/**
 * Server load function for the analytics dashboard page.
 * Parses URL filters, applies defaults (last 30 days), and fetches KPI data.
 */
import type { PageServerLoad } from './$types';
import { analyticsFiltersSchema } from './schemas/filters.schema';
import { ANALYTICS_REQUEST } from '$core/analytics/requests';
import { AnalyticsGranularity, AnalyticsSortOption, SortOrder } from '$core/analytics/enums';
import type {
	KpiCardsResponse,
	RevenueTimeSeriesResponse,
	BookingsTimeSeriesResponse,
	TopSuppliersResponse,
	TopActivitiesResponse,
	TopDestinationsResponse,
	TopAttractionsResponse
} from '$core/analytics/types';
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

const EMPTY_METRIC = { value: 0, previousValue: null, variation: null, variationPercent: null };

const EMPTY_KPIS: KpiCardsResponse = {
	gmv: EMPTY_METRIC,
	netRevenue: EMPTY_METRIC,
	bookings: EMPTY_METRIC,
	avgBookingValue: EMPTY_METRIC,
	avgTravellers: EMPTY_METRIC,
	cancellationRate: EMPTY_METRIC
};

const EMPTY_SUPPLIERS_SUMMARY = {
	totalSuppliers: 0,
	activeSuppliers: 0,
	activationRate: 0,
	avgBookingsPerSupplier: 0,
	avgBookingsPerActiveSupplier: 0
};

/** Wraps an API call so it returns a fallback instead of throwing. */
async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
	try {
		return await promise;
	} catch {
		return fallback;
	}
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

	const breadcrumbs = generateBreadcrumbs(url.pathname);

	const rankingFilters = {
		...apiFilters,
		sort: AnalyticsSortOption.BOOKINGS,
		order: SortOrder.DESC,
		limit: 10
	};

	const [
		kpis,
		revenueTimeSeries,
		bookingsTimeSeries,
		topSuppliers,
		topActivities,
		topDestinations,
		topAttractions
	] = await Promise.all([
		safe(ANALYTICS_REQUEST.getKpis(fetch, apiFilters), EMPTY_KPIS),
		safe<RevenueTimeSeriesResponse>(ANALYTICS_REQUEST.getRevenueTimeSeries(fetch, apiFilters), {
			data: []
		}),
		safe<BookingsTimeSeriesResponse>(ANALYTICS_REQUEST.getBookingsTimeSeries(fetch, apiFilters), {
			data: []
		}),
		safe<TopSuppliersResponse>(ANALYTICS_REQUEST.getTopSuppliers(fetch, rankingFilters), {
			data: [],
			summary: EMPTY_SUPPLIERS_SUMMARY
		}),
		safe<TopActivitiesResponse>(ANALYTICS_REQUEST.getTopActivities(fetch, rankingFilters), {
			data: []
		}),
		safe<TopDestinationsResponse>(ANALYTICS_REQUEST.getTopDestinations(fetch, rankingFilters), {
			data: []
		}),
		safe<TopAttractionsResponse>(ANALYTICS_REQUEST.getTopAttractions(fetch, rankingFilters), {
			data: []
		})
	]);

	return {
		kpis,
		revenueTimeSeries: revenueTimeSeries.data,
		bookingsTimeSeries: bookingsTimeSeries.data,
		topSuppliers: topSuppliers.data,
		suppliersSummary: topSuppliers.summary,
		topActivities: topActivities.data,
		topDestinations: topDestinations.data,
		topAttractions: topAttractions.data,
		filters: {
			...filters,
			dateFrom,
			dateTo,
			granularity
		},
		breadcrumbs
	};
};
