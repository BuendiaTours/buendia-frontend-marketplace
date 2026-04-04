import type { FiltersSchema } from '$lib/utils/filters';
import { AnalyticsGranularity } from '$core/analytics/enums';

export type AnalyticsDashboardFilters = {
	dateFrom?: string;
	dateTo?: string;
	granularity?: AnalyticsGranularity;
	activityKind?: 'PAID_TOUR' | 'FREE_TOUR';
	locationId?: string;
};

const VALID_GRANULARITIES = Object.values(AnalyticsGranularity);
const VALID_ACTIVITY_KINDS = ['PAID_TOUR', 'FREE_TOUR'] as const;

export const analyticsFiltersSchema: FiltersSchema<AnalyticsDashboardFilters> = {
	fields: {
		dateFrom: {
			parse: (raw) => raw || undefined,
			serialize: (value, out) => {
				if (value) {
					out.set('dateFrom', value);
				} else {
					out.delete('dateFrom');
				}
			},
			resetPageOnChange: false
		},
		dateTo: {
			parse: (raw) => raw || undefined,
			serialize: (value, out) => {
				if (value) {
					out.set('dateTo', value);
				} else {
					out.delete('dateTo');
				}
			},
			resetPageOnChange: false
		},
		granularity: {
			parse: (raw) => {
				if (VALID_GRANULARITIES.includes(raw as AnalyticsGranularity)) {
					return raw as AnalyticsGranularity;
				}
				return undefined;
			},
			serialize: (value, out) => {
				if (value) {
					out.set('granularity', value);
				} else {
					out.delete('granularity');
				}
			},
			resetPageOnChange: false
		},
		activityKind: {
			parse: (raw) => {
				if (VALID_ACTIVITY_KINDS.includes(raw as (typeof VALID_ACTIVITY_KINDS)[number])) {
					return raw as 'PAID_TOUR' | 'FREE_TOUR';
				}
				return undefined;
			},
			serialize: (value, out) => {
				if (value) {
					out.set('activityKind', value);
				} else {
					out.delete('activityKind');
				}
			},
			resetPageOnChange: false
		},
		locationId: {
			parse: (raw) => raw || undefined,
			serialize: (value, out) => {
				if (value) {
					out.set('locationId', value);
				} else {
					out.delete('locationId');
				}
			},
			resetPageOnChange: false
		}
	}
};
