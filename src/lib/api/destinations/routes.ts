/**
 * Rutas del backoffice para destinos
 * Colocado en el módulo API para mantener contexto
 */

import { backoffice } from '$lib/config/routes/core';

export const DESTINATION_ROUTES = {
	list: backoffice('destinations'),
	create: backoffice('destinations/create'),
	detail: (slug: string) => backoffice('destinations', slug),
	edit: (slug: string) => backoffice('destinations', slug, 'edit'),
	delete: (slug: string) => backoffice('destinations', slug, 'delete')
} as const;
