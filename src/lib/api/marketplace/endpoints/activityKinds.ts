/**
 * ACTIVITY KINDS ENDPOINTS - MARKETPLACE
 *
 * Solo métodos de LECTURA para la parte pública.
 */

import { apiClient } from '$core/_shared/client';
import { API_ENDPOINTS } from '$core/_shared/endpoints.config';

export type ActivityKind = {
	id: string;
	name: string;
};

export const activityKindsEndpoints = {
	async getAll(fetchFn: typeof fetch): Promise<ActivityKind[]> {
		const path = API_ENDPOINTS.activityKinds.list.path();

		const response = await apiClient.request<ActivityKind[]>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	}
};
