/**
 * Rutas de utilidades del backoffice
 * API Catalog, componentes de desarrollo, etc.
 */

import { backoffice } from '../core';

export const toolsRoutes = {
	apiCatalog: backoffice('api-catalog'),
	components: backoffice('components')
} as const;
