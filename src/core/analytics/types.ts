/**
 * @module analytics/types
 * @description TypeScript type definitions for the Analytics resource.
 * Organized into:
 * - **Responses** (read models returned by each analytics endpoint)
 * - **Filters** (query parameters shared across endpoints)
 *
 * All monetary values are in **cents** — conversion to display currency
 * happens in the presentation layer, not here.
 */

import type { AnalyticsGranularity, AnalyticsSortOption, SortOrder } from './enums';

// ── KPI Cards ──────────────────────────────────

/** A single KPI metric with optional comparison to the previous period. */
export type KpiCardMetric = {
	value: number;
	previousValue: number | null;
	variation: number | null;
	variationPercent: number | null;
};

/** Response from GET /analytics/kpis — six core business metrics. */
export type KpiCardsResponse = {
	gmv: KpiCardMetric;
	netRevenue: KpiCardMetric;
	bookings: KpiCardMetric;
	avgBookingValue: KpiCardMetric;
	avgTravellers: KpiCardMetric;
	cancellationRate: KpiCardMetric;
};

// ── Time Series ────────────────────────────────

/** A single data point in the revenue time-series. */
export type RevenueTimeSeriesPoint = {
	date: string;
	gmv: number;
	commission: number;
	gmvAP: number;
	gmvFT: number;
};

/** Response from GET /analytics/revenue/time-series. */
export type RevenueTimeSeriesResponse = {
	data: RevenueTimeSeriesPoint[];
};

/** A single data point in the bookings time-series. */
export type BookingsTimeSeriesPoint = {
	date: string;
	total: number;
	ap: number;
	ft: number;
};

/** Response from GET /analytics/bookings/time-series. */
export type BookingsTimeSeriesResponse = {
	data: BookingsTimeSeriesPoint[];
};

// ── Top Suppliers ──────────────────────────────

/** A supplier entry in the top-suppliers ranking. */
export type TopSupplierItem = {
	supplierId: string;
	supplierName: string;
	bookings: number;
	gmv: number;
	commission: number;
	cancellationRate: number;
};

/** Aggregate engagement metrics across all suppliers. */
export type SuppliersSummary = {
	totalSuppliers: number;
	activeSuppliers: number;
	activationRate: number;
	avgBookingsPerSupplier: number;
	avgBookingsPerActiveSupplier: number;
};

/** Response from GET /analytics/suppliers. */
export type TopSuppliersResponse = {
	data: TopSupplierItem[];
	summary: SuppliersSummary;
};

// ── Top Activities ─────────────────────────────

/** An activity entry in the top-activities ranking. */
export type TopActivityItem = {
	activityId: string;
	activityTitle: string;
	activityKind: 'PAID_TOUR' | 'FREE_TOUR';
	supplierId: string;
	supplierName: string;
	bookings: number;
	gmv: number;
	avgBookingValue: number;
	avgTravellers: number;
};

/** Response from GET /analytics/activities. */
export type TopActivitiesResponse = {
	data: TopActivityItem[];
};

// ── Top Attractions ───────────────────────────

/** An attraction entry in the top-attractions ranking. */
export type TopAttractionItem = {
	attractionId: string;
	attractionName: string;
	bookings: number;
	gmv: number;
	commission: number;
	avgBookingValue: number;
};

/** Response from GET /analytics/attractions. */
export type TopAttractionsResponse = {
	data: TopAttractionItem[];
};

// ── Top Destinations ──────────────────────────

/** A destination entry in the top-destinations ranking. */
export type TopDestinationItem = {
	locationId: string;
	locationName: string;
	locationKind: string;
	bookings: number;
	gmv: number;
	commission: number;
	avgBookingValue: number;
};

/** Response from GET /analytics/destinations. */
export type TopDestinationsResponse = {
	data: TopDestinationItem[];
};

// ── Filters (query params) ─────────────────────

/** Query parameters shared across all analytics endpoints. */
export type AnalyticsFilters = {
	dateFrom: string;
	dateTo: string;
	granularity?: AnalyticsGranularity;
	activityKind?: 'PAID_TOUR' | 'FREE_TOUR';
	locationId?: string;
	comparePrevious?: boolean;
	sort?: AnalyticsSortOption;
	order?: SortOrder;
	limit?: number;
};
