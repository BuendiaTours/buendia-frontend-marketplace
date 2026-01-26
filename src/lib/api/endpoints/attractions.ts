import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints.config';
import type { Attraction } from '$lib/types';

export const attractionsEndpoints = {
	async getAll(fetchFn: typeof fetch): Promise<Attraction[]> {
		const path = API_ENDPOINTS.attractions.list();

		const response = await apiClient.request<Attraction[]>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	},

	async getById(fetchFn: typeof fetch, id: string): Promise<Attraction> {
		const path = API_ENDPOINTS.attractions.detail(id);

		const response = await apiClient.request<Attraction>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	}
};
