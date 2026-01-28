import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints.config';

export type Category = {
	id: string;
	name: string;
	slug?: string;
};

export const categoriesEndpoints = {
	async getAll(fetchFn: typeof fetch): Promise<Category[]> {
		const path = API_ENDPOINTS.categories.list.path();

		const response = await apiClient.request<Category[]>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	},

	async getById(fetchFn: typeof fetch, id: string): Promise<Category> {
		const path = API_ENDPOINTS.categories.detail.path(id);

		const response = await apiClient.request<Category>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	}
};
