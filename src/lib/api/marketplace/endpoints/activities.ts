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

import { apiClient } from '$api-shared/client';
import { API_ENDPOINTS } from '$api-shared/endpoints.config';
import { toSkipLimit, buildEndpointUrl } from '$api-shared/params';
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
	order?: 'asc' | 'desc';
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
