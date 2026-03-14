import type { FiltersSchema } from '$lib/utils/filters';
import { createOrderField, createSortField } from '$lib/utils/filters';
import type { CriteriaSortOption } from '$core/_shared/enums';
import { CategoryStatus } from '$core/categories/enums';

export type CategoriesFilters = {
	page?: number;
	pageSize?: number;
	sort?: 'id' | 'name';
	order?: CriteriaSortOption;
	q?: string;
	status?: CategoryStatus;
};

export const categoriesFiltersSchema: FiltersSchema<CategoriesFilters> = {
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
		sort: createSortField(['id', 'name'] as const),
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
				if (Object.values(CategoryStatus).includes(raw as CategoryStatus)) {
					return raw as CategoryStatus;
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
