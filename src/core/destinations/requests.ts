/**
 * @module destinations/requests
 * @description API request functions for the Destinations resource.
 * Provides standard CRUD operations and criteria-based querying.
 */

import type { CriteriaResult } from '$core/_shared/types';
import { get, getWithParams, post, patch, del } from '$core/_shared/helpers';
import type {
	Destination,
	DestinationCreateDto,
	DestinationCriteria,
	DestinationUpdateDto
} from '$core/destinations/types';

/** @internal Base API path for the destinations resource. */
const BASE = '/destinations';

/**
 * Namespace containing all API request methods for destinations.
 * Each method accepts the SvelteKit-provided `fetch` as its first argument.
 */
export const DESTINATION_REQUEST = {
	/**
	 * Creates a new destination.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param data - Destination creation payload.
	 */
	create: (fetchFn: typeof fetch, data: DestinationCreateDto): Promise<void> =>
		post(fetchFn, BASE, data),

	/**
	 * Partially updates an existing destination.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Destination ID.
	 * @param data - Fields to update.
	 */
	update: (fetchFn: typeof fetch, id: string, data: DestinationUpdateDto): Promise<void> =>
		patch(fetchFn, `${BASE}/${id}`, data),

	/**
	 * Deletes a destination by ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Destination ID.
	 */
	delete: (fetchFn: typeof fetch, id: string): Promise<void> => del(fetchFn, `${BASE}/${id}`),

	/**
	 * Retrieves a single destination by its ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Destination ID.
	 */
	findById: (fetchFn: typeof fetch, id: string): Promise<Destination> =>
		get<Destination>(fetchFn, `${BASE}/${id}`),

	/**
	 * Retrieves a single destination by its URL slug.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param slug - URL-friendly identifier.
	 */
	findBySlug: (fetchFn: typeof fetch, slug: string): Promise<Destination> =>
		get<Destination>(fetchFn, `${BASE}/slug/${slug}`),

	/**
	 * Queries destinations using criteria-based filtering and pagination.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param criteria - Optional filter, sort, and pagination parameters.
	 */
	findByCriteria: (
		fetchFn: typeof fetch,
		criteria?: DestinationCriteria
	): Promise<CriteriaResult<Destination>> =>
		getWithParams<CriteriaResult<Destination>>(fetchFn, BASE, criteria)
};
