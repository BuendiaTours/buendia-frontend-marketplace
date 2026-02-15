/**
 * @module distributives/requests
 * @description API request functions for the Distributives resource.
 * Provides standard CRUD operations and criteria-based querying.
 */

import type { CriteriaResult } from '$core/_shared/types';
import { get, getWithParams, post, patch, del } from '$core/_shared/helpers';
import type {
	Distributive,
	DistributiveCreateDto,
	DistributiveCriteria,
	DistributiveUpdateDto
} from '$core/distributives/types';

/** @internal Base API path for the distributives resource. */
const BASE = '/distributives';

/**
 * Namespace containing all API request methods for distributives.
 * Each method accepts the SvelteKit-provided `fetch` as its first argument.
 */
export const DISTRIBUTIVE_REQUEST = {
	/**
	 * Creates a new distributive.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param data - Distributive creation payload.
	 */
	create: (fetchFn: typeof fetch, data: DistributiveCreateDto): Promise<void> =>
		post(fetchFn, BASE, data),

	/**
	 * Partially updates an existing distributive.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Distributive ID.
	 * @param data - Fields to update.
	 */
	update: (fetchFn: typeof fetch, id: string, data: DistributiveUpdateDto): Promise<void> =>
		patch(fetchFn, `${BASE}/${id}`, data),

	/**
	 * Deletes a distributive by ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Distributive ID.
	 */
	delete: (fetchFn: typeof fetch, id: string): Promise<void> => del(fetchFn, `${BASE}/${id}`),

	/**
	 * Retrieves a single distributive by its ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Distributive ID.
	 */
	findById: (fetchFn: typeof fetch, id: string): Promise<Distributive> =>
		get<Distributive>(fetchFn, `${BASE}/${id}`),

	/**
	 * Retrieves a single distributive by its URL slug.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param slug - URL-friendly identifier.
	 */
	findBySlug: (fetchFn: typeof fetch, slug: string): Promise<Distributive> =>
		get<Distributive>(fetchFn, `${BASE}/slug/${slug}`),

	/**
	 * Queries distributives using criteria-based filtering and pagination.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param criteria - Optional filter, sort, and pagination parameters.
	 */
	findByCriteria: (
		fetchFn: typeof fetch,
		criteria?: DistributiveCriteria
	): Promise<CriteriaResult<Distributive>> =>
		getWithParams<CriteriaResult<Distributive>>(fetchFn, BASE, criteria)
};
