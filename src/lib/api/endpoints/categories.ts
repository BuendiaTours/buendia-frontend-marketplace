/**
 * CATEGORIES ENDPOINTS - MARKETPLACE
 *
 * Solo métodos de LECTURA para la parte pública.
 */

import { apiClient } from '$core/_shared/client';
import { API_ENDPOINTS } from '$core/_shared/endpoints.config';

export type Category = {
	id: string;
	name: string;
	slug: string;
	title?: string;
	descriptionShort?: string;
};

export const categoriesEndpoints = {
	/**
	 * Obtener listado público de categorías
	 * La API devuelve un array directo, no un objeto paginado
	 */
	async getAll(fetchFn: typeof fetch): Promise<Category[]> {
		const path = API_ENDPOINTS.categories.list.path();

		const response = await apiClient.request<Category[]>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	},

	/**
	 * Obtener detalle público de una categoría
	 */
	async getById(fetchFn: typeof fetch, id: string): Promise<Category> {
		const path = API_ENDPOINTS.categories.detail.path(id);

		const response = await apiClient.request<Category>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	}
};
