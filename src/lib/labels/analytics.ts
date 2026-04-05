/**
 * UI labels for analytics enums.
 * Translations of domain enums for dropdowns, selects, etc.
 */

import { AnalyticsGranularity, AnalyticsSortOption } from '$core/analytics/enums';
import * as m from '$paraglide/messages';

export const GRANULARITY_OPTIONS = [
	{ id: AnalyticsGranularity.DAY, name: m.analytics_granularity_day() },
	{ id: AnalyticsGranularity.WEEK, name: m.analytics_granularity_week() },
	{ id: AnalyticsGranularity.MONTH, name: m.analytics_granularity_month() },
	{ id: AnalyticsGranularity.QUARTER, name: m.analytics_granularity_quarter() }
];

export const ACTIVITY_KIND_FILTER_OPTIONS = [
	{ id: 'PAID_TOUR', name: m.analytics_activityKind_paidTour() },
	{ id: 'FREE_TOUR', name: m.analytics_activityKind_freeTour() }
];

export const SUPPLIER_SORT_OPTIONS = [
	{ id: AnalyticsSortOption.BOOKINGS, name: m.analytics_supplierSort_bookings() },
	{ id: AnalyticsSortOption.GMV, name: m.analytics_supplierSort_gmv() },
	{ id: AnalyticsSortOption.COMMISSION, name: m.analytics_supplierSort_commission() }
];

export const ACTIVITY_SORT_OPTIONS = [
	{ id: AnalyticsSortOption.BOOKINGS, name: m.analytics_activitySort_bookings() },
	{ id: AnalyticsSortOption.GMV, name: m.analytics_activitySort_gmv() },
	{ id: AnalyticsSortOption.AVG_BOOKING_VALUE, name: m.analytics_activitySort_avgBookingValue() }
];
