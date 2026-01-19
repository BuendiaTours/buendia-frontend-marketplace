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

	// Reset page=1 si procede y si existe el campo 'page' en el schema
	if (shouldResetPage && 'page' in schema.fields) {
		out.set('page', '1');
	}

	return out;
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
