/**
 * Núcleo de rutas: prefijo y helper del backoffice
 *
 * Para cambiar el prefijo (ej: /backoffice → /admin):
 * 1. Cambiar BACKOFFICE_PREFIX aquí
 * 2. Renombrar carpeta: src/routes/backoffice → src/routes/admin
 */

export const BACKOFFICE_PREFIX = '/backoffice' as const;

export function backoffice(...segments: Array<string | undefined>): string {
	const path = segments.filter(Boolean).join('/');
	return `${BACKOFFICE_PREFIX}/${path}`.replace(/\/+/g, '/');
}
