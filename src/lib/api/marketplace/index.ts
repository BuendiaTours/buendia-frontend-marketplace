/**
 * API MARKETPLACE
 *
 * Export unificado de endpoints para el marketplace (parte pública).
 * Solo incluye métodos de LECTURA (getAll, getBySlug).
 * SIN create, update, delete.
 */

// Re-export shared (base común)
export { apiClient } from '../shared/client';
export { apiConfig } from '../shared/config';
export * from '../shared/types';
export * from '../shared/errors';

// Endpoints marketplace (solo lectura)
import { activitiesEndpoints } from './endpoints/activities';
import { destinationsEndpoints } from './endpoints/destinations';

export const api = {
	activities: activitiesEndpoints,
	destinations: destinationsEndpoints
	// Otros recursos se añadirán según se necesiten
};

// Export tipos específicos
export type { ActivitiesPublicParams } from './endpoints/activities';
export type { DestinationsPublicParams } from './endpoints/destinations';
