/**
 * Rutas del backoffice
 * Re-exporta desde los módulos API para mantener una única fuente de verdad
 */

import { backoffice } from '../core';
import { USER_ROUTES } from '$api-users/routes';
import { ACTIVITY_ROUTES } from '$api-activities/routes';
import { ATTRACTION_ROUTES } from '$api-attractions/routes';
import { DESTINATION_ROUTES } from '$api-destinations/routes';
import { toolsRoutes } from './tools';

export const backofficeRoutes = {
	home: backoffice(''),
	login: backoffice('login'),

	users: USER_ROUTES,
	activities: ACTIVITY_ROUTES,
	attractions: ATTRACTION_ROUTES,
	destinations: DESTINATION_ROUTES,
	...toolsRoutes
} as const;
