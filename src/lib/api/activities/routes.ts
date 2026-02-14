/**
 * Rutas del backoffice para actividades
 * Colocado en el módulo API para mantener contexto
 */

import { backoffice } from '$lib/config/routes/core';

export const ACTIVITY_ROUTES = {
	list: backoffice('activities'),
	create: backoffice('activities/create'),
	detail: (slug: string) => backoffice('activities', slug),
	edit: (slug: string) => backoffice('activities', slug, 'edit'),
	delete: (slug: string) => backoffice('activities', slug, 'delete')
} as const;
