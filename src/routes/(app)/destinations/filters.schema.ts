import type { FiltersSchema } from '$lib/utils/filters';
import {
	createBooleanField,
	createPageField,
	createPageSizeField,
	createOrderField,
	createSortField
} from '$lib/utils/filters';

export type DestinationsFilters = {
	page: number;
	pageSize: number;
	q?: string;
	// Ordenamiento
	sort?: 'id' | 'name' | 'slug' | 'kind';
	order?: 'asc' | 'desc';
	// Filtros avanzados
	kind?: 'CITY' | 'REGION' | 'COUNTRY';
	wheelchairAccessible?: boolean;
	breakfastIncluded?: boolean;
	kidsFreeTour?: boolean;
};

export const destinationsFiltersSchema: FiltersSchema<DestinationsFilters> = {
	fields: {
		page: createPageField(),
		pageSize: createPageSizeField(),
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
		sort: createSortField(['id', 'name', 'slug', 'kind'] as const),
		order: createOrderField(),
		kind: {
			parse: (raw) => {
				if (raw === 'CITY' || raw === 'REGION' || raw === 'COUNTRY') {
					return raw;
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
		},
		wheelchairAccessible: createBooleanField('wheelchairAccessible'),
		breakfastIncluded: createBooleanField('breakfastIncluded'),
		kidsFreeTour: createBooleanField('kidsFreeTour')
	}
};
