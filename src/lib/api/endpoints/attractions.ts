import { apiClient } from '../client';
import { API_ENDPOINTS, buildEndpointUrl } from '../endpoints.config';
import type { Attraction, Pagination } from '$lib/types';

export type AttractionsGetAllParams = {
	page?: number;
	pageSize?: number;
	q?: string;
	status?: 'ACTIVE' | 'DRAFT' | 'INACTIVE';
	wheelchairAccessible?: boolean;
	breakfastIncluded?: boolean;
	kidsFreeTour?: boolean;
	sort?: string;
	order?: 'asc' | 'desc';
};

export type AttractionsSearchParams = {
	q?: string;
};

export const attractionsEndpoints = {
	async getAll(
		fetchFn: typeof fetch,
		params?: AttractionsGetAllParams
	): Promise<{ data: Attraction[]; pagination: Pagination }> {
		const path = buildEndpointUrl(API_ENDPOINTS.attractions.list(), params);

		const response = await apiClient.request<{ data: Attraction[]; pagination: Pagination }>(
			fetchFn,
			path,
			{
				method: 'GET'
			}
		);

		return response.data;
	},

	async getById(fetchFn: typeof fetch, id: string): Promise<Attraction> {
		const path = API_ENDPOINTS.attractions.detail(id);

		const response = await apiClient.request<{ data: Attraction }>(fetchFn, path, {
			method: 'GET'
		});

		return response.data.data;
	},

	async getBySlug(fetchFn: typeof fetch, slug: string): Promise<Attraction> {
		const path = API_ENDPOINTS.attractions.detail(slug);

		const response = await apiClient.request<{ data: Attraction }>(fetchFn, path, {
			method: 'GET'
		});

		return response.data.data;
	},

	async search(fetchFn: typeof fetch, params?: AttractionsSearchParams): Promise<Attraction[]> {
		const path = buildEndpointUrl(API_ENDPOINTS.attractions.search(), params);

		const response = await apiClient.request<{ data: Attraction[] }>(fetchFn, path, {
			method: 'GET'
		});

		return response.data.data;
	},

	async delete(fetchFn: typeof fetch, slug: string): Promise<void> {
		const path = API_ENDPOINTS.attractions.delete(slug);

		await apiClient.request<void>(fetchFn, path, {
			method: 'DELETE'
		});
	}
};
