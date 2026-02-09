/**
 * API BACKOFFICE
 *
 * Export unificado de todos los endpoints y utilidades para el backoffice.
 * Incluye métodos CRUD completos (create, update, delete).
 */

// Re-export shared (base común)
export { apiClient } from '../shared/client';
export { apiConfig } from '../shared/config';
export * from '../shared/types';
export * from '../shared/errors';
export * from '../shared/endpoints.config';

// Endpoints backoffice (CRUD completo)
import { activitiesEndpoints } from './endpoints/activities';
import { destinationsEndpoints } from './endpoints/destinations';
import { categoriesEndpoints } from './endpoints/categories';
import { tagsEndpoints } from './endpoints/tags';
import { attractionsEndpoints } from './endpoints/attractions';
import { distributivesEndpoints } from './endpoints/distributives';

export const api = {
	activities: activitiesEndpoints,
	destinations: destinationsEndpoints,
	categories: categoriesEndpoints,
	tags: tagsEndpoints,
	attractions: attractionsEndpoints,
	distributives: distributivesEndpoints
};

// Export tipos específicos de parámetros
export type { ActivitiesGetAllParams } from './endpoints/activities';
export type { DestinationsSearchParams } from './endpoints/destinations';
export type { Category } from './endpoints/categories';
export type { Tag } from './endpoints/tags';
export type { Attraction } from '$lib/types';
export type { Distributive } from './endpoints/distributives';
