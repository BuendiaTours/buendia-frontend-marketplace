/**
 * @module analytics/enums
 * @description Domain enums for the Analytics resource.
 * These mirror the backend contract exactly and carry no UI or i18n dependencies.
 */

/** Time bucket granularity for time-series endpoints. */
export enum AnalyticsGranularity {
	DAY = 'DAY',
	WEEK = 'WEEK',
	MONTH = 'MONTH',
	QUARTER = 'QUARTER'
}

/** Sortable attributes for analytics table endpoints (suppliers, activities). */
export enum AnalyticsSortOption {
	BOOKINGS = 'BOOKINGS',
	GMV = 'GMV',
	COMMISSION = 'COMMISSION',
	AVG_BOOKING_VALUE = 'AVG_BOOKING_VALUE'
}

/** Sort direction for ranking endpoints. */
export enum SortOrder {
	ASC = 'ASC',
	DESC = 'DESC'
}
