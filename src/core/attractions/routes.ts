/**
 * Rutas del backoffice para atracciones
 * Colocado en el módulo API para mantener contexto
 */

import { backoffice } from '$lib/config/routes/core';

export const ATTRACTION_ROUTES = {
	list: backoffice('attractions'),
	create: backoffice('attractions/create'),
	detail: (slug: string) => backoffice('attractions', slug),
	edit: (slug: string) => backoffice('attractions', slug, 'edit'),
	delete: (slug: string) => backoffice('attractions', slug, 'delete')
} as const;
