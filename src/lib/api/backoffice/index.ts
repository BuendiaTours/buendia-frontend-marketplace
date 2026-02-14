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
} from '$core/_shared/client';
export { apiConfig } from '$core/_shared/config';
export * from '$core/_shared/types';
export * from '$core/_shared/errors';
export * from '$core/_shared/endpoints.config';
export { toSkipLimit, buildPagination, buildEndpointUrl } from '$core/_shared/params';

// Endpoints backoffice (CRUD completo) - estructura como $core/users
import * as activities from '$core/activities/requests';
import * as attractions from '$core/attractions/requests';
import * as destinations from '$core/destinations/requests';
import * as categories from '$core/categories/requests';
import * as tags from '$core/tags/requests';
import * as distributives from '$core/distributives/requests';
import { USER_REQUEST } from '$core/users/requests';

export const api = {
	activities: { ...activities, delete: activities.deleteBySlug },
	attractions: { ...attractions, delete: attractions.deleteBySlug },
	destinations: { ...destinations, delete: destinations.deleteBySlug },
	categories,
	tags,
	distributives,
	users: USER_REQUEST
};

// Export tipos específicos
export type { ActivitiesGetAllParams } from '$core/activities/types';
export type { DestinationsSearchParams } from '$core/destinations/types';
export type { Category } from '$core/categories/types';
export type { Tag } from '$core/tags/types';
export type { Attraction } from '$lib/types';
export type { Distributive } from '$core/distributives/types';
