import type { FiltersSchema } from '$lib/utils/filters';
import { createOrderField, createSortField } from '$lib/utils/filters';
import type { CriteriaSortOption } from '$core/_shared/enums';
import { AttractionStatus } from '$core/attractions/enums';

export type AttractionsFilters = {
	page?: number;
	pageSize?: number;
	sort?: 'id' | 'name' | 'status';
	order?: CriteriaSortOption;
	q?: string;
	status?: AttractionStatus;
};

export const attractionsFiltersSchema: FiltersSchema<AttractionsFilters> = {
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
		sort: createSortField(['id', 'name', 'status'] as const),
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
		status: {
			parse: (raw) => {
				if (Object.values(AttractionStatus).includes(raw as AttractionStatus)) {
					return raw as AttractionStatus;
				}
				return undefined;
			},
			serialize: (value, out) => {
				if (value) {
					out.set('status', value);
				} else {
					out.delete('status');
				}
			},
			resetPageOnChange: true
		}
	}
};
