import type { FiltersSchema } from '$lib/utils/filters';
import { createBooleanField, createOrderField, createSortField } from '$lib/utils/filters';

export type AttractionsFilters = {
	// Paginación (opcional - solo si la API la provee)
	page?: number;
	pageSize?: number;
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
