/**
 * ACTIVITIES ENDPOINTS - MARKETPLACE
 *
 * Solo métodos de LECTURA para la parte pública.
 * SIN create, update, delete (seguridad).
 *
 * Filtros públicos:
 * - Búsqueda por texto
 * - Filtro por destino, categoría
 * - Rango de precios
 * - Fechas
 * - Características (wheelchair, kids, breakfast)
 *
 * SIN filtros internos:
 * - status (DRAFT, PUBLISHED) → Solo se muestran PUBLISHED
 * - kind (interno)
 */

import { apiClient } from '$core/_shared/client';
import { API_ENDPOINTS } from '$core/_shared/endpoints.config';
import { toSkipLimit, buildEndpointUrl } from '$core/_shared/params';
import type { CriteriaSortOption } from '$core/_shared/enums';
import type { CriteriaResult, ActivityListItem } from '$lib/types';

/**
 * Parámetros públicos para listar actividades
 * Solo incluye filtros relevantes para usuarios finales
 */
export type ActivitiesPublicParams = {
	page?: number;
	pageSize?: number;
	search?: string; // Búsqueda de texto
	destination?: string; // Filtro por destino
	category?: string; // Filtro por categoría
	kind?: string; // Filtro por tipo (FREE_TOUR, PAID_TOUR, etc.)
	priceMin?: number; // Rango de precio
	priceMax?: number;
	dateFrom?: string; // Filtros de fecha
	dateTo?: string;
	wheelchairAccessible?: boolean;
	freeForKids?: boolean;
	breakfast?: boolean;
	sort?: string;
	order?: CriteriaSortOption;
};

export const activitiesEndpoints = {
	/**
	 * Obtener listado público de actividades
	 * Solo devuelve actividades PUBLISHED
	 */
	async getAll(
		fetchFn: typeof fetch,
		params?: ActivitiesPublicParams
	): Promise<CriteriaResult<ActivityListItem>> {
		const path = buildEndpointUrl(API_ENDPOINTS.activities.list.path(), toSkipLimit(params));

		const response = await apiClient.request<CriteriaResult<ActivityListItem>>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	},

	/**
	 * Obtener detalle público de una actividad
	 * Solo devuelve si está PUBLISHED
	 */
	async getById(fetchFn: typeof fetch, id: string): Promise<ActivityListItem> {
		const path = API_ENDPOINTS.activities.detail.path(id);

		const response = await apiClient.request<ActivityListItem>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	},

	async getBySlug(fetchFn: typeof fetch, slug: string): Promise<ActivityListItem> {
		const path = API_ENDPOINTS.activities.detailBySlug.path(slug);

		const response = await apiClient.request<ActivityListItem>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	}

	// SIN: create, update, delete, getStatuses, getKinds
	// Estos métodos solo existen en api/backoffice
};
