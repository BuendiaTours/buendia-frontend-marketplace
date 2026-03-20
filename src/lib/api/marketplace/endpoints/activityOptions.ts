import { apiClient } from '$core/_shared/client';
import { API_ENDPOINTS } from '$core/_shared/endpoints.config';
import type { ActivityOption } from '$lib/types';

export const activityOptionsEndpoints = {
	async getByActivityId(fetchFn: typeof fetch, activityId: string): Promise<ActivityOption[]> {
		const path = API_ENDPOINTS.activityOptions.byActivity.path(activityId);

		const response = await apiClient.request<ActivityOption[]>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	}
};
