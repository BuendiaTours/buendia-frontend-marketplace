import { apiClient } from '../client';
import { API_ENDPOINTS, buildEndpointUrl } from '../endpoints.config';
import type { ActivityListResponse, ActivityListItem } from '$lib/types';

export type ActivitiesGetAllParams = {
	page?: number;
	pageSize?: number;
	from?: string;
	to?: string;
	destination?: string;
	isFreeTour?: boolean;
	freeForKids?: boolean;
	breakfast?: boolean;
	wheelchairAccessible?: boolean;
	sort?: string;
	order?: 'asc' | 'desc';
};

export const activitiesEndpoints = {
	async getAll(
		fetchFn: typeof fetch,
		params?: ActivitiesGetAllParams
	): Promise<ActivityListResponse> {
		const path = buildEndpointUrl(API_ENDPOINTS.activities.list.path(), params);

		const response = await apiClient.request<ActivityListResponse>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	},

	async getBySlug(fetchFn: typeof fetch, slug: string): Promise<ActivityListItem> {
		const path = API_ENDPOINTS.activities.detail.path(slug);

		const response = await apiClient.request<ActivityListItem>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	},

	async create(fetchFn: typeof fetch, data: Partial<ActivityListItem>): Promise<ActivityListItem> {
		const path = API_ENDPOINTS.activities.create.path();

		const response = await apiClient.request<ActivityListItem>(fetchFn, path, {
			method: 'POST',
			body: JSON.stringify(data)
		});

		return response.data;
	},

	async update(
		fetchFn: typeof fetch,
		slug: string,
		data: Partial<ActivityListItem>
	): Promise<ActivityListItem> {
		const path = API_ENDPOINTS.activities.update.path(slug);

		const response = await apiClient.request<ActivityListItem>(fetchFn, path, {
			method: 'PUT',
			body: JSON.stringify(data)
		});

		return response.data;
	},

	async delete(fetchFn: typeof fetch, slug: string): Promise<void> {
		const path = API_ENDPOINTS.activities.delete.path(slug);

		await apiClient.request<void>(fetchFn, path, {
			method: 'DELETE'
		});
	},

	async getStatuses(fetchFn: typeof fetch): Promise<Array<{ id: string; name: string }>> {
		const path = API_ENDPOINTS.activities.statuses.path();

		const response = await apiClient.request<Array<{ id: string; name: string }>>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	}
};
