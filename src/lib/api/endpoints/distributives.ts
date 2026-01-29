import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints.config';

export type Distributive = {
	id: string;
	name: string;
	slug?: string;
};

export const distributivesEndpoints = {
	async getAll(fetchFn: typeof fetch): Promise<Distributive[]> {
		const path = API_ENDPOINTS.distributives.list.path();

		const response = await apiClient.request<Distributive[]>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	},

	async getById(fetchFn: typeof fetch, id: string): Promise<Distributive> {
		const path = API_ENDPOINTS.distributives.detail.path(id);

		const response = await apiClient.request<Distributive>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	}
};
