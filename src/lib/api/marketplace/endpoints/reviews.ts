/**
 * REVIEWS ENDPOINTS - MARKETPLACE
 *
 * Solo métodos de LECTURA para la parte pública.
 * Devuelve las reviews de una actividad por su ID.
 */

import { apiClient } from '$core/_shared/client';
import { API_ENDPOINTS } from '$core/_shared/endpoints.config';
import type { ActivityReview } from '$lib/types';

export const reviewsEndpoints = {
	/**
	 * Obtener reviews públicas de una actividad
	 */
	async getByActivityId(fetchFn: typeof fetch, activityId: string): Promise<ActivityReview[]> {
		const path = API_ENDPOINTS.reviews.byActivity.path(activityId);

		const response = await apiClient.request<ActivityReview[]>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	}
};
