/**
 * API BACKOFFICE
 *
 * Export unificado de todos los endpoints y utilidades para el backoffice.
 * Incluye métodos CRUD completos (create, update, delete).
 */

// Re-export shared (base común)
export {
	apiClient,
	getQueryCount,
	getQueryLog,
	resetQueryCount,
	type QueryLogEntry
} from '$api-shared/client';
export { apiConfig } from '$api-shared/config';
export * from '$api-shared/types';
export * from '$api-shared/errors';
export * from '$api-shared/endpoints.config';
export { toSkipLimit, buildPagination, buildEndpointUrl } from '$api-shared/params';

// Endpoints backoffice (CRUD completo) - estructura como $api-users
import * as activities from '$api-activities/requests';
import * as attractions from '$api-attractions/requests';
import * as destinations from '$api-destinations/requests';
import * as categories from '$api-categories/requests';
import * as tags from '$api-tags/requests';
import * as distributives from '$api-distributives/requests';
import * as users from '$api-users/requests';

export const api = {
	activities: { ...activities, delete: activities.deleteBySlug },
	attractions: { ...attractions, delete: attractions.deleteBySlug },
	destinations: { ...destinations, delete: destinations.deleteBySlug },
	categories,
	tags,
	distributives,
	users
};

// Export tipos específicos
export type { ActivitiesGetAllParams } from '$api-activities/types';
export type { DestinationsSearchParams } from '$api-destinations/types';
export type { Category } from '$api-categories/types';
export type { Tag } from '$api-tags/types';
export type { Attraction } from '$lib/types';
export type { Distributive } from '$api-distributives/types';
