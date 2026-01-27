import type { FiltersSchema } from '$lib/utils/filters';
import {
	createBooleanField,
	createPageField,
	createPageSizeField,
	createOrderField,
	createSortField
} from '$lib/utils/filters';

export type AttractionsFilters = {
	// Paginación
	page: number;
	pageSize: number;
	// Ordenamiento
	sort?: 'id' | 'name' | 'slug' | 'status';
	order?: 'asc' | 'desc';
	// Búsqueda
	q?: string;
	status?: 'ACTIVE' | 'DRAFT' | 'INACTIVE';
	// Filtros avanzados
	wheelchairAccessible?: boolean;
	breakfastIncluded?: boolean;
	kidsFreeTour?: boolean;
};

export const attractionsFiltersSchema: FiltersSchema<AttractionsFilters> = {
	fields: {
		page: createPageField(),
		pageSize: createPageSizeField(),
		sort: createSortField(['id', 'name', 'slug', 'status'] as const),
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
				if (raw === 'ACTIVE' || raw === 'DRAFT' || raw === 'INACTIVE') {
					return raw;
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
		},

		// Filtros booleanos - todos usan la misma configuración
		wheelchairAccessible: createBooleanField('wheelchairAccessible'),
		breakfastIncluded: createBooleanField('breakfastIncluded'),
		kidsFreeTour: createBooleanField('kidsFreeTour')
	}
};
