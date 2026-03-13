/**
 * @module locations/requests
 * @description API request functions for the Locations resource.
 * Provides standard CRUD operations and criteria-based querying.
 */

import type { CriteriaResult } from '$core/_shared/types';
import { get, getWithParams, post, patch, del } from '$core/_shared/helpers';
import type {
	Location,
	LocationCreateDto,
	LocationCriteria,
	LocationUpdateDto
} from '$core/locations/types';

/** @internal Base API path for the locations resource. */
const BASE = '/locations';

/**
 * Namespace containing all API request methods for locations.
 * Each method accepts the SvelteKit-provided `fetch` as its first argument.
 */
export const LOCATION_REQUEST = {
	create: (fetchFn: typeof fetch, data: LocationCreateDto): Promise<void> =>
		post(fetchFn, BASE, data),

	update: (fetchFn: typeof fetch, id: string, data: LocationUpdateDto): Promise<void> =>
		patch(fetchFn, `${BASE}/${id}`, data),

	updateBySlug: (fetchFn: typeof fetch, slug: string, data: LocationUpdateDto): Promise<void> =>
		patch(fetchFn, `${BASE}/slug/${slug}`, data),

	delete: (fetchFn: typeof fetch, id: string): Promise<void> => del(fetchFn, `${BASE}/${id}`),

	findById: (fetchFn: typeof fetch, id: string): Promise<Location> =>
		get<Location>(fetchFn, `${BASE}/${id}`),

	findBySlug: (fetchFn: typeof fetch, slug: string): Promise<Location> =>
		get<Location>(fetchFn, `${BASE}/slug/${slug}`),

	findByCriteria: (
		fetchFn: typeof fetch,
		criteria?: LocationCriteria
	): Promise<CriteriaResult<Location>> =>
		getWithParams<CriteriaResult<Location>>(fetchFn, BASE, criteria)
};
