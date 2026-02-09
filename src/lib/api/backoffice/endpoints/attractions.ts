import { apiClient } from '../../shared/client';
import { API_ENDPOINTS, buildEndpointUrl } from '../../shared/endpoints.config';
import type { Attraction, Pagination } from '$lib/types';
import type { AttractionStatus } from '$lib/config/enums';

export type AttractionsGetAllParams = {
	page?: number;
	pageSize?: number;
	q?: string;
	status?: AttractionStatus;
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
		const path = buildEndpointUrl(API_ENDPOINTS.attractions.list.path(), params);

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
		const path = API_ENDPOINTS.attractions.detail.path(id);

		const response = await apiClient.request<{ data: Attraction }>(fetchFn, path, {
			method: 'GET'
		});

		return response.data.data;
	},

	async getBySlug(fetchFn: typeof fetch, slug: string): Promise<Attraction> {
		const path = API_ENDPOINTS.attractions.detail.path(slug);

		const response = await apiClient.request<Attraction>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	},

	async search(fetchFn: typeof fetch, params?: AttractionsSearchParams): Promise<Attraction[]> {
		const path = buildEndpointUrl(API_ENDPOINTS.attractions.search.path(), params);

		const response = await apiClient.request<{ data: Attraction[] }>(fetchFn, path, {
			method: 'GET'
		});

		return response.data.data;
	},

	async delete(fetchFn: typeof fetch, slug: string): Promise<void> {
		const path = API_ENDPOINTS.attractions.delete.path(slug);

		await apiClient.request<void>(fetchFn, path, {
			method: 'DELETE'
		});
	},

	async getStatuses(fetchFn: typeof fetch): Promise<Array<{ id: string; name: string }>> {
		const path = API_ENDPOINTS.attractions.statuses.path();

		const response = await apiClient.request<Array<{ id: string; name: string }>>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	},

	async create(fetchFn: typeof fetch, data: Partial<Attraction>): Promise<Attraction> {
		const path = API_ENDPOINTS.attractions.list.path();

		const response = await apiClient.request<Attraction>(fetchFn, path, {
			method: 'POST',
			body: JSON.stringify(data)
		});

		return response.data;
	},

	async update(
		fetchFn: typeof fetch,
		slug: string,
		data: Partial<Attraction>
	): Promise<Attraction> {
		const path = API_ENDPOINTS.attractions.detail.path(slug);

		const response = await apiClient.request<Attraction>(fetchFn, path, {
			method: 'PUT',
			body: JSON.stringify(data)
		});

		return response.data;
	}
};
