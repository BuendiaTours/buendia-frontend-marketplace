/**
 * LOCATIONS ENDPOINTS - MARKETPLACE
 *
 * Solo métodos de LECTURA para la parte pública.
 * SIN create, update, delete.
 */

import { apiClient } from '$core/_shared/client';
import { API_ENDPOINTS } from '$core/_shared/endpoints.config';
import { toSkipLimit, buildEndpointUrl } from '$core/_shared/params';
import type { CriteriaSortOption } from '$core/_shared/enums';
import type { CriteriaResult, Location } from '$lib/types';

export type LocationsPublicParams = {
	page?: number;
	pageSize?: number;
	search?: string;
	wheelchairAccessible?: boolean;
	breakfastIncluded?: boolean;
	kidsFreeTour?: boolean;
	sort?: string;
	order?: CriteriaSortOption;
};

export const locationsEndpoints = {
	async getAll(
		fetchFn: typeof fetch,
		params?: LocationsPublicParams
	): Promise<CriteriaResult<Location>> {
		const path = buildEndpointUrl(API_ENDPOINTS.locations.list.path(), toSkipLimit(params));

		const response = await apiClient.request<CriteriaResult<Location>>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	},

	async getBySlug(fetchFn: typeof fetch, slug: string): Promise<Location> {
		const path = API_ENDPOINTS.locations.detailBySlug.path(slug);

		const response = await apiClient.request<Location>(fetchFn, path, {
			method: 'GET'
		});

		return response.data;
	}
};
