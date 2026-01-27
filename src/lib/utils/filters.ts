// src/lib/utils/filters.ts

export type PatchValue<T> = T | null | undefined;

/**
 * Definición mínima de un campo en el schema:
 * - parse: string|null -> tipo T (o undefined si no aplica)
 * - serialize: tipo T -> string|null (null => borrar de la URL)
 */
export type FieldDef<T> = {
	parse: (raw: string | null, all: URLSearchParams) => T | undefined;
	serialize: (value: T | undefined, out: URLSearchParams, all: Record<string, unknown>) => void;
	/**
	 * Si este campo cambia, normalmente queremos resetear page=1.
	 * (page y pageSize normalmente false; filtros true)
	 */
	resetPageOnChange?: boolean;
};

export type FiltersSchema<TFilters extends Record<string, any>> = {
	fields: {
		[K in keyof TFilters]: FieldDef<TFilters[K]>;
	};
};

/**
 * Parsea la URL (searchParams) a un objeto tipado usando el schema.
 */
export function parseFilters<TFilters extends Record<string, any>>(
	schema: FiltersSchema<TFilters>,
	searchParams: URLSearchParams
): TFilters {
	const result: Partial<TFilters> = {};

	for (const key in schema.fields) {
		const field = schema.fields[key];
		const raw = searchParams.get(String(key));
		const parsed = field.parse(raw, searchParams);
		if (parsed !== undefined) {
			result[key as keyof TFilters] = parsed;
		}
	}

	return result as TFilters;
}

/**
 * Serializa un objeto de filtros a URLSearchParams según el schema.
 * - Si un campo no debe estar en URL, su serializer debe "delete".
 */
export function serializeFilters<TFilters extends Record<string, any>>(
	schema: FiltersSchema<TFilters>,
	filters: Partial<TFilters>,
	base?: URLSearchParams
): URLSearchParams {
	const out = new URLSearchParams(base ? base.toString() : undefined);

	for (const key in schema.fields) {
		const field = schema.fields[key];
		const value = filters[key as keyof TFilters];
		field.serialize(value, out, filters as Record<string, unknown>);
	}

	return out;
}

/**
 * Aplica un "patch" (cambios parciales) sobre una URL actual, usando el schema.
 *
 * Semántica del patch:
 * - undefined => no tocar ese campo
 * - null => borrar ese campo de la URL
 * - valor => set (según serializer)
 *
 * Además:
 * - Si cambia un campo marcado con resetPageOnChange, pone page=1 (si existe en el schema)
 */
export function patchFilters<TFilters extends Record<string, any>>(
	schema: FiltersSchema<TFilters>,
	current: URLSearchParams,
	patch: { [K in keyof TFilters]?: PatchValue<TFilters[K]> }
): URLSearchParams {
	const out = new URLSearchParams(current.toString());

	let shouldResetPage = false;

	for (const key in patch) {
		const value = patch[key as keyof typeof patch];

		// undefined => no tocar
		if (value === undefined) continue;

		const field = schema.fields[key as keyof TFilters];
		if (!field) continue;

		// null => borrar param directamente (simple y predecible)
		if (value === null) {
			out.delete(String(key));
		} else {
			// valor => delegamos en serializer
			field.serialize(value as any, out, {} as Record<string, unknown>);
		}

		if (field.resetPageOnChange) {
			shouldResetPage = true;
		}
	}

	// Reset page=1 solo si:
	// 1. Un campo con resetPageOnChange cambió
	// 2. El campo 'page' existe en el schema
	// 3. El parámetro 'page' ya está presente en la URL actual (hay paginación activa)
	if (shouldResetPage && 'page' in schema.fields && current.has('page')) {
		out.set('page', '1');
	}

	return out;
}

/**
 * Detecta si hay filtros activos (excluyendo page y pageSize).
 * Útil para habilitar/deshabilitar el botón de "Limpiar filtros".
 *
 * @param filters - El objeto de filtros parseados
 * @param excludeKeys - Claves a excluir de la verificación (por defecto: ['page', 'pageSize'])
 * @returns true si hay algún filtro activo
 *
 * @example
 * ```typescript
 * import { hasActiveFilters } from '$lib/utils/filters';
 *
 * const hasFilters = $derived(hasActiveFilters(filters));
 *
 * <button disabled={!hasFilters} onclick={handleClearFilters}>
 *   Limpiar filtros
 * </button>
 * ```
 */
export function hasActiveFilters<TFilters extends Record<string, any>>(
	filters: TFilters,
	excludeKeys: (keyof TFilters)[] = ['page', 'pageSize', 'sort', 'order']
): boolean {
	for (const key in filters) {
		// Saltar claves excluidas (page, pageSize)
		if (excludeKeys.includes(key as keyof TFilters)) {
			continue;
		}

		const value = filters[key];

		// Si el valor existe y no es undefined/null, hay un filtro activo
		if (value !== undefined && value !== null) {
			// Para arrays, verificar que no estén vacíos
			if (Array.isArray(value) && value.length === 0) {
				continue;
			}
			// Para strings, verificar que no estén vacíos
			if (typeof value === 'string' && value.trim() === '') {
				continue;
			}
			// Hay un filtro activo
			return true;
		}
	}

	return false;
}

/**
 * Limpia todos los filtros navegando a la URL base (sin query params).
 * Los valores por defecto del schema se aplicarán automáticamente.
 *
 * @param pathname - La ruta actual (ej: '/activities')
 * @param gotoFn - La función goto de SvelteKit
 *
 * @example
 * ```typescript
 * import { clearFilters } from '$lib/utils/filters';
 * import { goto } from '$app/navigation';
 * import { page } from '$app/stores';
 *
 * function handleClearFilters() {
 *   clearFilters($page.url.pathname, goto);
 * }
 * ```
 */
export function clearFilters(
	pathname: string,
	gotoFn: (
		url: string,
		opts?: { replaceState?: boolean; noScroll?: boolean; keepFocus?: boolean }
	) => Promise<void>
): Promise<void> {
	return gotoFn(pathname, {
		replaceState: true,
		noScroll: true,
		keepFocus: true
	});
}

/**
 * Limpia todos los filtros excepto paginación y ordenación.
 * Preserva los parámetros 'sort' y 'order', elimina todos los demás filtros,
 * y resetea 'page' a 1.
 *
 * @param pathname - La ruta actual (ej: '/activities')
 * @param currentParams - Los parámetros actuales de la URL
 * @param gotoFn - La función goto de SvelteKit
 *
 * @example
 * ```typescript
 * import { clearAllFilters } from '$lib/utils/filters';
 * import { goto } from '$app/navigation';
 * import { page } from '$app/stores';
 *
 * function handleClearAllFilters() {
 *   clearAllFilters($page.url.pathname, $page.url.searchParams, goto);
 * }
 * ```
 */
export function clearAllFilters(
	pathname: string,
	currentParams: URLSearchParams,
	gotoFn: (
		url: string,
		opts?: { replaceState?: boolean; noScroll?: boolean; keepFocus?: boolean }
	) => Promise<void>
): Promise<void> {
	const newParams = new URLSearchParams();

	// Preservar ordenación si existe
	const sort = currentParams.get('sort');
	const order = currentParams.get('order');
	const page = currentParams.get('page');

	if (sort) {
		newParams.set('sort', sort);
	}
	if (order) {
		newParams.set('order', order);
	}
	if (page) {
		newParams.set('page', '1');
	}

	// Construir nueva URL
	const newUrl = newParams.toString() ? `${pathname}?${newParams.toString()}` : pathname;

	return gotoFn(newUrl, {
		replaceState: true,
		noScroll: true,
		keepFocus: true
	});
}

/**
 * Elimina los parámetros de ordenación (sort y order) de la URL,
 * preservando todos los demás parámetros.
 *
 * @param pathname - La ruta actual (ej: '/activities')
 * @param currentParams - Los parámetros actuales de la URL
 * @param gotoFn - La función goto de SvelteKit
 *
 * @example
 * ```typescript
 * import { resetSort } from '$lib/utils/filters';
 * import { goto } from '$app/navigation';
 * import { page } from '$app/stores';
 *
 * function handleResetSort() {
 *   resetSort($page.url.pathname, $page.url.searchParams, goto);
 * }
 * ```
 */
export function resetSort(
	pathname: string,
	currentParams: URLSearchParams,
	gotoFn: (
		url: string,
		opts?: { replaceState?: boolean; noScroll?: boolean; keepFocus?: boolean }
	) => Promise<void>
): Promise<void> {
	const newParams = new URLSearchParams(currentParams.toString());

	// Eliminar parámetros de ordenación
	newParams.delete('sort');
	newParams.delete('order');

	// Construir nueva URL
	const newUrl = newParams.toString() ? `${pathname}?${newParams.toString()}` : pathname;

	return gotoFn(newUrl, {
		replaceState: true,
		noScroll: true,
		keepFocus: true
	});
}

/**
 * Helper para crear campos booleanos en schemas de filtros.
 * Los campos booleanos se representan en la URL como "1" cuando están activos,
 * y se eliminan cuando están inactivos.
 *
 * @param fieldName - Nombre del campo en la URL
 * @returns FieldDef<boolean | undefined> configurado para campos booleanos
 *
 * @example
 * ```typescript
 * import { createBooleanField } from '$lib/utils/filters';
 *
 * const schema = {
 *   fields: {
 *     isFreeTour: createBooleanField('isFreeTour'),
 *     petFriendly: createBooleanField('petFriendly')
 *   }
 * };
 * ```
 */
export function createBooleanField(fieldName: string): FieldDef<boolean | undefined> {
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

/**
 * Helper para crear el campo 'page' en schemas de filtros.
 * Parsea el número de página desde la URL, con valor por defecto 1.
 *
 * @param defaultValue - Valor por defecto (default: 1)
 * @returns FieldDef<number> configurado para el campo page
 *
 * @example
 * ```typescript
 * import { createPageField } from '$lib/utils/filters';
 *
 * const schema = {
 *   fields: {
 *     page: createPageField()
 *   }
 * };
 * ```
 */
export function createPageField(defaultValue = 1): FieldDef<number> {
	return {
		parse: (raw) => {
			const num = parseInt(raw || String(defaultValue), 10);
			return num > 0 ? num : defaultValue;
		},
		serialize: (value, out) => {
			out.set('page', String(value ?? defaultValue));
		},
		resetPageOnChange: false
	};
}

/**
 * Helper para crear el campo 'pageSize' en schemas de filtros.
 * Parsea el tamaño de página desde la URL, con valor por defecto 10.
 *
 * @param defaultValue - Valor por defecto (default: 10)
 * @returns FieldDef<number> configurado para el campo pageSize
 *
 * @example
 * ```typescript
 * import { createPageSizeField } from '$lib/utils/filters';
 *
 * const schema = {
 *   fields: {
 *     pageSize: createPageSizeField(20) // default 20 items per page
 *   }
 * };
 * ```
 */
export function createPageSizeField(defaultValue = 10): FieldDef<number> {
	return {
		parse: (raw) => {
			const num = parseInt(raw || String(defaultValue), 10);
			return num > 0 ? num : defaultValue;
		},
		serialize: (value, out) => {
			out.set('pageSize', String(value ?? defaultValue));
		},
		resetPageOnChange: false
	};
}

/**
 * Helper para crear el campo 'sort' en schemas de filtros.
 * Valida que el campo de ordenación sea uno de los valores permitidos.
 *
 * @param validSorts - Array de campos válidos para ordenar
 * @returns FieldDef<T | undefined> configurado para el campo sort
 *
 * @example
 * ```typescript
 * import { createSortField } from '$lib/utils/filters';
 *
 * const schema = {
 *   fields: {
 *     sort: createSortField(['name', 'createdAt', 'status'] as const)
 *   }
 * };
 * ```
 */
export function createSortField<T extends string>(
	validSorts: readonly T[]
): FieldDef<T | undefined> {
	return {
		parse: (raw) => {
			if (raw && validSorts.includes(raw as T)) {
				return raw as T;
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
	};
}

/**
 * Helper para crear el campo 'order' en schemas de filtros.
 * Valida que el orden sea 'asc' o 'desc'.
 *
 * @returns FieldDef<'asc' | 'desc' | undefined> configurado para el campo order
 *
 * @example
 * ```typescript
 * import { createOrderField } from '$lib/utils/filters';
 *
 * const schema = {
 *   fields: {
 *     order: createOrderField()
 *   }
 * };
 * ```
 */
export function createOrderField(): FieldDef<'asc' | 'desc' | undefined> {
	return {
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
	};
}
