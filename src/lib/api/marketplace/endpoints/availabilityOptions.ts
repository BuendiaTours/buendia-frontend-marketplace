import { apiClient } from '$core/_shared/client';
import { API_ENDPOINTS } from '$core/_shared/endpoints.config';
import type { AvailabilityData } from '$lib/types';

export const availabilityOptionsEndpoints = {
	async getByActivityId(
		fetchFn: typeof fetch,
		activityId: string,
		fromDate?: string
	): Promise<AvailabilityData> {
		const path = API_ENDPOINTS.availabilityOptions.byActivity.path(activityId, fromDate);

		const response = await apiClient.request<AvailabilityData>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	}
};
