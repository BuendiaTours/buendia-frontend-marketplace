/**
 * @module attractions/requests
 * @description API request functions for the Attractions resource.
 * Provides standard CRUD operations and criteria-based querying.
 */

import type { CriteriaResult } from '$core/_shared/types';
import { get, getWithParams, post, patch, del } from '$core/_shared/helpers';
import type {
	Attraction,
	AttractionCreateDto,
	AttractionCriteria,
	AttractionUpdateDto
} from '$core/attractions/types';

/** @internal Base API path for the attractions resource. */
const BASE = '/attractions';

/**
 * Namespace containing all API request methods for attractions.
 * Each method accepts the SvelteKit-provided `fetch` as its first argument.
 */
export const ATTRACTION_REQUEST = {
	/**
	 * Creates a new attraction.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param data - Attraction creation payload.
	 */
	create: (fetchFn: typeof fetch, data: AttractionCreateDto): Promise<void> =>
		post(fetchFn, BASE, data),

	/**
	 * Partially updates an existing attraction.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Attraction ID.
	 * @param data - Fields to update.
	 */
	update: (fetchFn: typeof fetch, id: string, data: AttractionUpdateDto): Promise<void> =>
		patch(fetchFn, `${BASE}/${id}`, data),

	/**
	 * Deletes an attraction by ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Attraction ID.
	 */
	delete: (fetchFn: typeof fetch, id: string): Promise<void> => del(fetchFn, `${BASE}/${id}`),

	/**
	 * Retrieves a single attraction by its ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Attraction ID.
	 */
	findById: (fetchFn: typeof fetch, id: string): Promise<Attraction> =>
		get<Attraction>(fetchFn, `${BASE}/${id}`),

	/**
	 * Retrieves a single attraction by its URL slug.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param slug - URL-friendly identifier.
	 */
	findBySlug: (fetchFn: typeof fetch, slug: string): Promise<Attraction> =>
		get<Attraction>(fetchFn, `${BASE}/slug/${slug}`),

	/**
	 * Queries attractions using criteria-based filtering and pagination.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param criteria - Optional filter, sort, and pagination parameters.
	 */
	findByCriteria: (
		fetchFn: typeof fetch,
		criteria?: AttractionCriteria
	): Promise<CriteriaResult<Attraction>> =>
		getWithParams<CriteriaResult<Attraction>>(fetchFn, BASE, criteria)
};
