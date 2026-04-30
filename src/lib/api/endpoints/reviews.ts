/**
 * REVIEWS ENDPOINTS - MARKETPLACE
 *
 * Solo métodos de LECTURA para la parte pública.
 * Devuelve las reviews de una actividad por su ID.
 */

import { bookingsApiClient as apiClient } from '$core/_shared/client';
import { API_ENDPOINTS } from '$core/_shared/endpoints.config';
import type {
	ActivityReview,
	ActivityReviewParams,
	ActivityReviewsResponse,
	ReviewGalleryAttachment
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
		const basePath = API_ENDPOINTS.reviews.byActivity.path();
		const qs = new URLSearchParams();
		qs.set('activityId', activityId);
		if (params?.sort) qs.set('sort', params.sort);
		if (params?.order) qs.set('order', params.order);
		if (params?.skip !== undefined) qs.set('skip', String(params.skip));
		if (params?.limit) qs.set('limit', String(params.limit));
		if (params?.averageRatings && params.averageRatings.length > 0)
			params.averageRatings.forEach((r) => qs.append('averageRatings', String(r)));
		const path = `${basePath}?${qs}`;

		const response = await apiClient.request<ActivityReviewsResponse>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	},

	/**
	 * Obtener reviews públicas de un destino por slug
	 */
	async getByDestinationSlug(
		fetchFn: typeof fetch,
		slug: string,
		page = 1
	): Promise<ActivityReviewsResponse> {
		const path = API_ENDPOINTS.reviews.byDestinationSlug.path(slug, page);

		const response = await apiClient.request<ActivityReviewsResponse>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	},

	async getById(fetchFn: typeof fetch, reviewId: string): Promise<ActivityReview> {
		const path = API_ENDPOINTS.reviews.byId.path(reviewId);
		const response = await apiClient.request<ActivityReview>(fetchFn, path, { method: 'GET' });
		return response.data;
	},

	async getAttachmentsByActivityId(
		fetchFn: typeof fetch,
		activityId: string
	): Promise<{ data: ReviewGalleryAttachment[] }> {
		const path = API_ENDPOINTS.reviews.byActivityAttachments.path(activityId);

		const response = await apiClient.request<{ data: ReviewGalleryAttachment[] }>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	}
};
