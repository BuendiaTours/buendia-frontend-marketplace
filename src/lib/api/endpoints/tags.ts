import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints.config';

export type Tag = {
	id: string;
	name: string;
	slug?: string;
};

export const tagsEndpoints = {
	async getAll(fetchFn: typeof fetch): Promise<Tag[]> {
		const path = API_ENDPOINTS.tags.list.path();

		const response = await apiClient.request<Tag[]>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	},

	async getById(fetchFn: typeof fetch, id: string): Promise<Tag> {
		const path = API_ENDPOINTS.tags.detail.path(id);

		const response = await apiClient.request<Tag>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	}
};
