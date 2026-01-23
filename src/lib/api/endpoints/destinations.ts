import { apiClient } from '../client';
import { API_ENDPOINTS, buildEndpointUrl } from '../endpoints.config';
import type { Destination } from '$lib/types';

export type DestinationsSearchParams = {
	q?: string;
};

export const destinationsEndpoints = {
	async getAll(fetchFn: typeof fetch): Promise<Destination[]> {
		const path = API_ENDPOINTS.destinations.list();

		const response = await apiClient.request<Destination[]>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	},

	async getById(fetchFn: typeof fetch, id: string): Promise<Destination> {
		const path = API_ENDPOINTS.destinations.detail(id);

		const response = await apiClient.request<Destination>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	},

	async search(fetchFn: typeof fetch, params?: DestinationsSearchParams): Promise<Destination[]> {
		const path = buildEndpointUrl(API_ENDPOINTS.destinations.search(), params);

		const response = await apiClient.request<Destination[]>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	}
};
