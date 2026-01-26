// GUÍA: Cómo añadir un nuevo filtro
// ===================================
//
// Para añadir un nuevo filtro a la página de actividades, sigue estos pasos:
//
// 1. TIPO: Añade el campo al tipo ActivitiesFilters (línea ~5)
//    Ejemplo: petFriendly?: boolean;
//
// 2. SCHEMA: Añade el campo al schema usando el helper apropiado (línea ~105)
//    - Para booleanos: petFriendly: createBooleanField('petFriendly')
//    - Para strings: copia el patrón de 'location' o 'from'/'to'
//
// 3. SERVIDOR (+page.server.ts): Añade el filtro a la petición API (línea ~30)
//    if (filters.petFriendly) {
//      apiUrl.searchParams.set('petFriendly', '1');
//    }
//
// 4. CLIENTE (+page.svelte):
//    - Para filtros avanzados (booleanos): añade a advancedFiltersConfig (línea ~230)
//      { key: 'petFriendly', label: 'Admite mascotas' }
//    - Para otros filtros: crea el handler y UI correspondiente
//
// ¡Eso es todo! El resto se genera automáticamente con loops.
//
// ===================================

import type { FiltersSchema } from '$lib/utils/filters';
import {
	createBooleanField,
	createPageField,
	createPageSizeField,
	createOrderField,
	createSortField
} from '$lib/utils/filters';

export type ActivitiesFilters = {
	// Paginación
	page: number;
	pageSize: number;
	// Ordenamiento
	sort?: 'codeRef' | 'title' | 'status' | 'kind';
	order?: 'asc' | 'desc';
	// Fechas
	from?: string;
	to?: string;
	// Búsqueda
	destination?: string;
	// Booleanos, todos se inicializan igual
	audioGuideAvailable?: boolean;
	breakfastIncluded?: boolean;
	isFreeTour?: boolean;
	kidsFreeTour?: boolean;
	photographyAllowed?: boolean;
	smallGroup?: boolean;
	wheelchairAccessible?: boolean;
};

export const activitiesFiltersSchema: FiltersSchema<ActivitiesFilters> = {
	fields: {
		page: createPageField(),
		pageSize: createPageSizeField(),
		sort: createSortField(['codeRef', 'title', 'status', 'kind'] as const),
		order: createOrderField(),
		from: {
			parse: (raw) => {
				if (!raw) return undefined;
				// Validar formato YYYY-MM-DD
				if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return undefined;
				return raw;
			},
			serialize: (value, out) => {
				if (value) {
					out.set('from', value);
				} else {
					out.delete('from');
				}
			},
			resetPageOnChange: true
		},
		to: {
			parse: (raw) => {
				if (!raw) return undefined;
				// Validar formato YYYY-MM-DD
				if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return undefined;
				return raw;
			},
			serialize: (value, out) => {
				if (value) {
					out.set('to', value);
				} else {
					out.delete('to');
				}
			},
			resetPageOnChange: true
		},
		destination: {
			parse: (raw) => {
				return raw || undefined;
			},
			serialize: (value, out) => {
				if (value) {
					out.set('destination', value);
				} else {
					out.delete('destination');
				}
			},
			resetPageOnChange: true
		},

		// Filtros booleanos - todos usan la misma configuración
		isFreeTour: createBooleanField('isFreeTour'),
		kidsFreeTour: createBooleanField('kidsFreeTour'),
		breakfastIncluded: createBooleanField('breakfastIncluded'),
		wheelchairAccessible: createBooleanField('wheelchairAccessible'),
		audioGuideAvailable: createBooleanField('audioGuideAvailable'),
		photographyAllowed: createBooleanField('photographyAllowed'),
		smallGroup: createBooleanField('smallGroup')
	}
};
