/**
 * ROUTES CONFIGURATION
 *
 * Configuración centralizada de prefijos de rutas del proyecto.
 *
 * Para cambiar el prefijo del backoffice (ej: /backoffice → /admin):
 * 1. Cambiar BACKOFFICE_PREFIX aquí
 * 2. Renombrar carpeta: src/routes/backoffice → src/routes/admin
 * 3. ¡Todos los links se actualizan automáticamente!
 */

/**
 * Prefijo base del backoffice en las URLs
 *
 * @example
 * '/backoffice' → URLs como /backoffice/activities
 * '/admin'      → URLs como /admin/activities
 * '/extranet'   → URLs como /extranet/activities
 */
export const BACKOFFICE_PREFIX = '/backoffice' as const;

/**
 * Helper: Construye rutas del backoffice con el prefijo configurado
 *
 * @param path - Ruta relativa (sin / inicial)
 * @returns Ruta completa con prefijo
 *
 * @example
 * backoffice('activities') → '/backoffice/activities'
 * backoffice('activities/create') → '/backoffice/activities/create'
 * backoffice('activities', slug, 'edit') → '/backoffice/activities/{slug}/edit'
 */
export function backoffice(...segments: Array<string | undefined>): string {
	const path = segments.filter(Boolean).join('/');
	return `${BACKOFFICE_PREFIX}/${path}`.replace(/\/+/g, '/');
}

/**
 * Constantes de rutas del backoffice
 * Usar estas constantes en lugar de strings hardcoded
 */
export const ROUTES = {
	backoffice: {
		home: backoffice(''),
		login: backoffice('login'),

		activities: {
			list: backoffice('activities'),
			create: backoffice('activities/create'),
			detail: (slug: string) => backoffice('activities', slug),
			edit: (slug: string) => backoffice('activities', slug, 'edit'),
			delete: (slug: string) => backoffice('activities', slug, 'delete')
		},

		destinations: {
			list: backoffice('destinations'),
			create: backoffice('destinations/create'),
			detail: (slug: string) => backoffice('destinations', slug),
			edit: (slug: string) => backoffice('destinations', slug, 'edit'),
			delete: (slug: string) => backoffice('destinations', slug, 'delete')
		},

		attractions: {
			list: backoffice('attractions'),
			create: backoffice('attractions/create'),
			detail: (slug: string) => backoffice('attractions', slug),
			edit: (slug: string) => backoffice('attractions', slug, 'edit'),
			delete: (slug: string) => backoffice('attractions', slug, 'delete')
		},

		apiCatalog: backoffice('api-catalog'),
		components: backoffice('components')
	}
} as const;
