import { apiClient } from '$core/_shared/client';
import { API_ENDPOINTS } from '$core/_shared/endpoints.config';
import type { AvailabilityOption } from '$lib/types';

export const availabilityOptionsEndpoints = {
	async getByActivityId(fetchFn: typeof fetch, activityId: string): Promise<AvailabilityOption[]> {
		const path = API_ENDPOINTS.availabilityOptions.byActivity.path(activityId);

		const response = await apiClient.request<AvailabilityOption[]>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	}
};
