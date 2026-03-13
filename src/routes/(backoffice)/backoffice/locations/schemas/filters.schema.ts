import type { FiltersSchema } from '$lib/utils/filters';
import { createOrderField, createSortField } from '$lib/utils/filters';
import type { CriteriaSortOption } from '$core/_shared/enums';
import { LocationKind } from '$core/locations/enums';

export type LocationsFilters = {
	page?: number;
	pageSize?: number;
	sort?: 'id' | 'name' | 'kind';
	order?: CriteriaSortOption;
	q?: string;
	kind?: LocationKind;
};

export const locationsFiltersSchema: FiltersSchema<LocationsFilters> = {
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
		sort: createSortField(['id', 'name', 'kind'] as const),
		order: createOrderField(),
		q: {
			parse: (raw) => {
				return raw || undefined;
			},
			serialize: (value, out) => {
				if (value) {
					out.set('q', value);
				} else {
					out.delete('q');
				}
			},
			resetPageOnChange: true
		},
		kind: {
			parse: (raw) => {
				if (Object.values(LocationKind).includes(raw as LocationKind)) {
					return raw as LocationKind;
				}
				return undefined;
			},
			serialize: (value, out) => {
				if (value) {
					out.set('kind', value);
				} else {
					out.delete('kind');
				}
			},
			resetPageOnChange: true
		}
	}
};
