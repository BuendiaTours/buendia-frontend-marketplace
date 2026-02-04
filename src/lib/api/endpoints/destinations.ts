import { apiClient } from '../client';
import { API_ENDPOINTS, buildEndpointUrl } from '../endpoints.config';
import type { Destination, Pagination } from '$lib/types';
import type { DestinationKind } from '$lib/config/enums';

export type DestinationsGetAllParams = {
	page?: number;
	pageSize?: number;
	q?: string;
	kind?: DestinationKind;
	wheelchairAccessible?: boolean;
	breakfastIncluded?: boolean;
	kidsFreeTour?: boolean;
	sort?: string;
	order?: 'asc' | 'desc';
};

export type DestinationsSearchParams = {
	q?: string;
};

export const destinationsEndpoints = {
	async getAll(
		fetchFn: typeof fetch,
		params?: DestinationsGetAllParams
	): Promise<{ data: Destination[]; pagination: Pagination }> {
		const path = buildEndpointUrl(API_ENDPOINTS.destinations.list.path(), params);

		const response = await apiClient.request<{ data: Destination[]; pagination: Pagination }>(
			fetchFn,
			path,
			{
				method: 'GET'
			}
		);

		return response.data;
	},

	async getById(fetchFn: typeof fetch, id: string): Promise<Destination> {
		const path = API_ENDPOINTS.destinations.detail.path(id);

		const response = await apiClient.request<{ data: Destination }>(fetchFn, path, {
			method: 'GET'
		});

		return response.data.data;
	},

	async getBySlug(fetchFn: typeof fetch, slug: string): Promise<Destination> {
		const path = API_ENDPOINTS.destinations.detail.path(slug);

		const response = await apiClient.request<Destination>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	},

	async search(fetchFn: typeof fetch, params?: DestinationsSearchParams): Promise<Destination[]> {
		const path = buildEndpointUrl(API_ENDPOINTS.destinations.search.path(), params);

		const response = await apiClient.request<{ data: Destination[] }>(fetchFn, path, {
			method: 'GET'
		});

		return response.data.data;
	},

	async delete(fetchFn: typeof fetch, slug: string): Promise<void> {
		const path = API_ENDPOINTS.destinations.delete.path(slug);

		await apiClient.request<void>(fetchFn, path, {
			method: 'DELETE'
		});
	},

	async create(fetchFn: typeof fetch, data: Partial<Destination>): Promise<Destination> {
		const path = API_ENDPOINTS.destinations.list.path();

		const response = await apiClient.request<Destination>(fetchFn, path, {
			method: 'POST',
			body: JSON.stringify(data)
		});

		return response.data;
	},

	async update(
		fetchFn: typeof fetch,
		slug: string,
		data: Partial<Destination>
	): Promise<Destination> {
		const path = API_ENDPOINTS.destinations.detail.path(slug);

		const response = await apiClient.request<Destination>(fetchFn, path, {
			method: 'PUT',
			body: JSON.stringify(data)
		});

		return response.data;
	}
};
