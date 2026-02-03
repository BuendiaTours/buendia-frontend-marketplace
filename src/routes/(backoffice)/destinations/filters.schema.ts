import type { FiltersSchema } from '$lib/utils/filters';
import { createBooleanField, createOrderField, createSortField } from '$lib/utils/filters';

export type DestinationsFilters = {
	// Paginación (opcional - solo si la API la provee)
	page?: number;
	pageSize?: number;
	// Ordenamiento
	sort?: 'id' | 'name' | 'slug' | 'kind';
	order?: 'asc' | 'desc';
	// Búsqueda
	q?: string;
	kind?: 'CITY' | 'REGION' | 'COUNTRY';
	// Filtros avanzados
	wheelchairAccessible?: boolean;
	breakfastIncluded?: boolean;
	kidsFreeTour?: boolean;
};

export const destinationsFiltersSchema: FiltersSchema<DestinationsFilters> = {
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
		sort: createSortField(['id', 'name', 'slug', 'kind'] as const),
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
				// if (raw === 'CITY' || raw === 'REGION' || raw === 'COUNTRY') {
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

		// Filtros booleanos - todos usan la misma configuración
		wheelchairAccessible: createBooleanField('wheelchairAccessible'),
		breakfastIncluded: createBooleanField('breakfastIncluded'),
		kidsFreeTour: createBooleanField('kidsFreeTour')
	}
};
