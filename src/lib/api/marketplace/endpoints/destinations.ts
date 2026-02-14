/**
 * DESTINATIONS ENDPOINTS - MARKETPLACE
 *
 * Solo métodos de LECTURA para la parte pública.
 * SIN create, update, delete.
 */

import { apiClient } from '$api-shared/client';
import { API_ENDPOINTS } from '$api-shared/endpoints.config';
import { toSkipLimit, buildEndpointUrl } from '$api-shared/params';
import type { CriteriaResult, Destination } from '$lib/types';

export type DestinationsPublicParams = {
	page?: number;
	pageSize?: number;
	search?: string; // Búsqueda de texto
	wheelchairAccessible?: boolean;
	breakfastIncluded?: boolean;
	kidsFreeTour?: boolean;
	sort?: string;
	order?: 'asc' | 'desc';
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
	}

	// SIN: create, update, delete, search (solo backoffice)
};
