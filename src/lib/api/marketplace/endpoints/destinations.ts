/**
 * DESTINATIONS ENDPOINTS - MARKETPLACE
 *
 * Solo métodos de LECTURA para la parte pública.
 * SIN create, update, delete.
 */

import { apiClient } from '$core/_shared/client';
import { API_ENDPOINTS } from '$core/_shared/endpoints.config';
import { toSkipLimit, buildEndpointUrl } from '$core/_shared/params';
import type { CriteriaSortOption } from '$core/_shared/enums';
import type { CriteriaResult, Destination, DestinationActivitiesResult } from '$lib/types';

export type DestinationsPublicParams = {
	page?: number;
	pageSize?: number;
	search?: string; // Búsqueda de texto
	wheelchairAccessible?: boolean;
	breakfastIncluded?: boolean;
	kidsFreeTour?: boolean;
	sort?: string;
	order?: CriteriaSortOption;
	// SIN: kind (interno)
};

export const destinationsEndpoints = {
	/**
	 * Obtener listado público de destinos
	 */
	async getAll(
		fetchFn: typeof fetch,
		params?: DestinationsPublicParams
	): Promise<CriteriaResult<Destination>> {
		const path = buildEndpointUrl(API_ENDPOINTS.destinations.list.path(), toSkipLimit(params));

		const response = await apiClient.request<CriteriaResult<Destination>>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	},

	/**
	 * Obtener detalle público de un destino
	 */
	async getBySlug(fetchFn: typeof fetch, slug: string): Promise<Destination> {
		const path = API_ENDPOINTS.destinations.detailBySlug.path(slug);

		const response = await apiClient.request<Destination>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	},

	/**
	 * Obtener actividades paginadas de un destino por su ID
	 */
	async getActivitiesById(
		fetchFn: typeof fetch,
		id: string,
		params?: {
			page?: number;
			pageSize?: number;
			kind?: string;
			kidsFreeTour?: boolean;
			wheelchairAccessible?: boolean;
			breakfastIncluded?: boolean;
			audioGuideAvailable?: boolean;
			photographyAllowed?: boolean;
			smallGroup?: boolean;
		}
	): Promise<DestinationActivitiesResult> {
		const path = buildEndpointUrl(
			API_ENDPOINTS.destinations.activitiesByDestination.path(id),
			params
		);

		const response = await apiClient.request<DestinationActivitiesResult>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	}

	// SIN: create, update, delete, search (solo backoffice)
};
