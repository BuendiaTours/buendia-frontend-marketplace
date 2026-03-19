/**
 * URL-driven filter schema for the pickup points list page.
 * Defines how each filter field is parsed from and serialized to URL search params.
 */
import type { FiltersSchema } from '$lib/utils/filters';
import { createOrderField, createSortField } from '$lib/utils/filters';
import type { CriteriaSortOption } from '$core/_shared/enums';

export type PickupPointsFilters = {
	page?: number;
	pageSize?: number;
	sort?: 'NAME' | 'CREATED_AT';
	order?: CriteriaSortOption;
	q?: string;
};

export const pickupPointsFiltersSchema: FiltersSchema<PickupPointsFilters> = {
	fields: {
		page: {
			parse: (raw) => {
				if (!raw) return undefined;
				const num = parseInt(raw, 10);
				return num > 0 ? num : undefined;
			},
			serialize: (value, out) => {
				if (value !== undefined) {
					out.set('page', String(value));
				} else {
					out.delete('page');
				}
			},
			resetPageOnChange: false
		},
		pageSize: {
			parse: (raw) => {
				if (!raw) return undefined;
				const num = parseInt(raw, 10);
				return num > 0 ? num : undefined;
			},
			serialize: (value, out) => {
				if (value !== undefined) {
					out.set('pageSize', String(value));
				} else {
					out.delete('pageSize');
				}
			},
			resetPageOnChange: false
		},
		sort: createSortField(['NAME', 'CREATED_AT'] as const),
		order: createOrderField(),
		q: {
			parse: (raw) => raw || undefined,
			serialize: (value, out) => {
				if (value) {
					out.set('q', value);
				} else {
					out.delete('q');
				}
			},
			resetPageOnChange: true
		}
	}
};
