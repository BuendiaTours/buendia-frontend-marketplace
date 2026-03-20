/**
 * REVIEWS ENDPOINTS - MARKETPLACE
 *
 * Solo métodos de LECTURA para la parte pública.
 * Devuelve las reviews de una actividad por su ID.
 */

import { apiClient } from '$core/_shared/client';
import { API_ENDPOINTS } from '$core/_shared/endpoints.config';
import type {
	ActivityReviewParams,
	ActivityReviewsResponse,
	ActivityReviewStats
} from '$lib/types';

export const reviewsEndpoints = {
	/**
	 * Obtener reviews públicas de una actividad
	 */
	async getByActivityId(
		fetchFn: typeof fetch,
		activityId: string,
		params?: ActivityReviewParams
	): Promise<ActivityReviewsResponse> {
		const basePath = API_ENDPOINTS.reviews.byActivity.path(activityId);
		const qs = new URLSearchParams();
		if (params?.sort) qs.set('sort', params.sort);
		if (params?.order) qs.set('order', params.order);
		if (params?.page) qs.set('page', String(params.page));
		if (params?.pageSize) qs.set('pageSize', String(params.pageSize));
		if (params?.stars && params.stars.length > 0) qs.set('stars', params.stars.join(','));
		const path = qs.size ? `${basePath}?${qs}` : basePath;

		const response = await apiClient.request<ActivityReviewsResponse>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	},

	/**
	 * Obtener estadísticas de reviews de una actividad
	 */
	async getStatsByActivityId(
		fetchFn: typeof fetch,
		activityId: string
	): Promise<ActivityReviewStats> {
		const path = API_ENDPOINTS.reviews.byActivityStats.path(activityId);

		const response = await apiClient.request<ActivityReviewStats>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	}
};
