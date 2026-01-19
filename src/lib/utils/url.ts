/**
 * Construye una URL añadiendo los query params actuales.
 * Útil para preservar filtros al navegar entre páginas.
 *
 * @param basePath - Ruta base (ej: '/activities/barcelona-tour/edit')
 * @param currentParams - URLSearchParams actuales (normalmente de $page.url.searchParams)
 * @param options - Opciones de configuración
 * @param options.exclude - Array de claves a excluir (ej: ['page'] para no volver a la misma página)
 * @param options.override - Objeto con parámetros a sobrescribir o añadir
 *
 * @returns URL completa con query params
 *
 * @example
 * ```typescript
 * // En el componente
 * import { buildUrlWithFilters } from '$lib/utils/url';
 * import { page } from '$app/stores';
 *
 * // Preservar todos los filtros
 * const editUrl = buildUrlWithFilters(`/activities/${item.slug}/edit`, $page.url.searchParams);
 * // => '/activities/barcelona-tour/edit?location=barcelona&from=2026-01-01&to=2026-01-15&page=2'
 *
 * // Preservar filtros pero resetear la página
 * const editUrl = buildUrlWithFilters(
 *   `/activities/${item.slug}/edit`,
 *   $page.url.searchParams,
 *   { exclude: ['page'] }
 * );
 * // => '/activities/barcelona-tour/edit?location=barcelona&from=2026-01-01&to=2026-01-15'
 *
 * // Preservar filtros y añadir/sobrescribir algunos
 * const editUrl = buildUrlWithFilters(
 *   `/activities/${item.slug}/edit`,
 *   $page.url.searchParams,
 *   { override: { tab: 'details' } }
 * );
 * // => '/activities/barcelona-tour/edit?location=barcelona&page=2&tab=details'
 * ```
 */
export function buildUrlWithFilters(
	basePath: string,
	currentParams: URLSearchParams,
	options?: {
		exclude?: string[];
		override?: Record<string, string | number | boolean>;
	}
): string {
	const newParams = new URLSearchParams();
	const excludeSet = new Set(options?.exclude || []);

	for (const [key, value] of currentParams.entries()) {
		if (!excludeSet.has(key)) {
			newParams.set(key, value);
		}
	}

	if (options?.override) {
		for (const [key, value] of Object.entries(options.override)) {
			newParams.set(key, String(value));
		}
	}

	const queryString = newParams.toString();
	return queryString ? `${basePath}?${queryString}` : basePath;
}
