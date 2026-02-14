/**
 * Rutas del backoffice para usuarios
 * Colocado en el módulo API para mantener contexto
 */

import { backoffice } from '$lib/config/routes/core';

export const USER_ROUTES = {
	list: backoffice('users'),
	create: backoffice('users/create'),
	detail: (id: string) => backoffice('users', id),
	edit: (id: string) => backoffice('users', id, 'edit'),
	delete: (id: string) => backoffice('users', id, 'delete')
} as const;
