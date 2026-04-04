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

/** Sortable attributes for the top-suppliers ranking. */
export enum SupplierSort {
	BOOKINGS = 'bookings',
	GMV = 'gmv',
	COMMISSION = 'commission'
}

/** Sortable attributes for the top-activities ranking. */
export enum ActivitySort {
	BOOKINGS = 'bookings',
	GMV = 'gmv',
	AVG_BOOKING_VALUE = 'avgBookingValue'
}

/** Sort direction for ranking endpoints. */
export enum SortOrder {
	ASC = 'ASC',
	DESC = 'DESC'
}
