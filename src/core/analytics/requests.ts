/**
 * @module analytics/requests
 * @description API request functions for the Analytics resource.
 * Read-only endpoints — no mutations. All endpoints accept shared
 * {@link AnalyticsFilters} and return pre-aggregated data from the backend.
 */

import { getWithParams } from '$core/_shared/helpers';
import type {
	AnalyticsFilters,
	BookingsTimeSeriesResponse,
	KpiCardsResponse,
	RevenueTimeSeriesResponse,
	TopActivitiesResponse,
	TopSuppliersResponse
} from '$core/analytics/types';

/** @internal Base API path for analytics endpoints. */
const BASE = '/analytics';

/**
 * Namespace containing all API request methods for analytics.
 * Each method accepts the SvelteKit-provided `fetch` as its first argument
 * to preserve SSR compatibility and cookie forwarding.
 */
export const ANALYTICS_REQUEST = {
	/**
	 * Retrieves the six core KPI cards with optional period comparison.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param filters - Date range, activity kind, location, and comparePrevious flag.
	 */
	getKpis: (fetchFn: typeof fetch, filters: AnalyticsFilters): Promise<KpiCardsResponse> =>
		getWithParams<KpiCardsResponse>(fetchFn, `${BASE}/kpis`, filters),

	/**
	 * Retrieves revenue time-series data bucketed by granularity.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param filters - Date range, granularity, activity kind, and location.
	 */
	getRevenueTimeSeries: (
		fetchFn: typeof fetch,
		filters: AnalyticsFilters
	): Promise<RevenueTimeSeriesResponse> =>
		getWithParams<RevenueTimeSeriesResponse>(fetchFn, `${BASE}/revenue/time-series`, filters),

	/**
	 * Retrieves bookings time-series data bucketed by granularity.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param filters - Date range, granularity, activity kind, and location.
	 */
	getBookingsTimeSeries: (
		fetchFn: typeof fetch,
		filters: AnalyticsFilters
	): Promise<BookingsTimeSeriesResponse> =>
		getWithParams<BookingsTimeSeriesResponse>(fetchFn, `${BASE}/bookings/time-series`, filters),

	/**
	 * Retrieves top suppliers ranking with engagement summary.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param filters - Date range, activity kind, location, sort, order, and limit.
	 */
	getTopSuppliers: (
		fetchFn: typeof fetch,
		filters: AnalyticsFilters
	): Promise<TopSuppliersResponse> =>
		getWithParams<TopSuppliersResponse>(fetchFn, `${BASE}/suppliers`, filters),

	/**
	 * Retrieves top activities ranking.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param filters - Date range, activity kind, location, sort, order, and limit.
	 */
	getTopActivities: (
		fetchFn: typeof fetch,
		filters: AnalyticsFilters
	): Promise<TopActivitiesResponse> =>
		getWithParams<TopActivitiesResponse>(fetchFn, `${BASE}/activities`, filters)
};
