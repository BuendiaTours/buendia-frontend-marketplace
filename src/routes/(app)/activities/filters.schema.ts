// src/routes/(app)/activities/filters.schema.ts
//
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

export type ActivitiesFilters = {
	from?: string;
	destination?: string;
	page: number;
	pageSize: number;
	to?: string;
	// Ordenamiento
	sort?: 'codeRef' | 'title' | 'status' | 'kind';
	order?: 'asc' | 'desc';
	// Booleanos, todos se inicializan igual
	audioGuideAvailable?: boolean;
	breakfastIncluded?: boolean;
	isFreeTour?: boolean;
	kidsFreeTour?: boolean;
	photographyAllowed?: boolean;
	smallGroup?: boolean;
	wheelchairAccessible?: boolean;
};

// Helper para crear campos booleanos con la misma configuración
function createBooleanField(fieldName: string) {
	return {
		parse: (raw: string | null) => {
			return raw !== null ? true : undefined;
		},
		serialize: (value: boolean | undefined, out: URLSearchParams) => {
			if (value === true) {
				out.set(fieldName, '1');
			} else {
				out.delete(fieldName);
			}
		},
		resetPageOnChange: true
	};
}

export const activitiesFiltersSchema: FiltersSchema<ActivitiesFilters> = {
	fields: {
		page: {
			parse: (raw) => {
				const num = parseInt(raw || '1', 10);
				return num > 0 ? num : 1;
			},
			serialize: (value, out) => {
				out.set('page', String(value ?? 1));
			},
			resetPageOnChange: false
		},
		pageSize: {
			parse: (raw) => {
				const num = parseInt(raw || '10', 10);
				return num > 0 ? num : 10;
			},
			serialize: (value, out) => {
				out.set('pageSize', String(value ?? 10));
			},
			resetPageOnChange: false
		},
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
		sort: {
			parse: (raw) => {
				const validSorts: readonly string[] = ['codeRef', 'title', 'status', 'kind'];
				if (raw && validSorts.includes(raw)) {
					return raw as 'codeRef' | 'title' | 'status' | 'kind';
				}
				return undefined;
			},
			serialize: (value, out) => {
				if (value) {
					out.set('sort', value);
				} else {
					out.delete('sort');
				}
			},
			resetPageOnChange: false
		},
		order: {
			parse: (raw) => {
				if (raw === 'asc' || raw === 'desc') {
					return raw;
				}
				return undefined;
			},
			serialize: (value, out) => {
				if (value) {
					out.set('order', value);
				} else {
					out.delete('order');
				}
			},
			resetPageOnChange: false
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
