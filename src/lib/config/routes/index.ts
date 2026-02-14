/**
 * ROUTES CONFIGURATION
 *
 * Rutas definidas en cada módulo API ($api-users/routes, $api-activities/routes, etc.)
 * y agregadas aquí para Header, breadcrumbs y usos que necesitan todas.
 *
 * Estructura:
 * - core.ts         — prefijo y helper backoffice()
 * - backoffice/     — re-exporta desde módulos API + tools (api-catalog, components)
 */

export { BACKOFFICE_PREFIX, backoffice } from './core';
export { backofficeRoutes } from './backoffice';

import { backofficeRoutes } from './backoffice';

export const ROUTES = {
	backoffice: backofficeRoutes
} as const;
