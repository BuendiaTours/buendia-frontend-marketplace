/**
 * @module distributives/requests
 * @description API request functions for the Distributives resource.
 * Provides CRUD operations, sub-resource management, and criteria-based querying.
 */

import type { CriteriaResult } from '$core/_shared/types';
import { get, getWithParams, post, patch, del } from '$core/_shared/helpers';
import type {
	Distributive,
	DistributiveAttractionAddDto,
	DistributiveCategoryAddDto,
	DistributiveContentBlockAddDto,
	DistributiveCreateDto,
	DistributiveCriteria,
	DistributiveGroupedByCategory,
	DistributiveLocationAddDto,
	DistributiveRelatedAttraction,
	DistributiveUpdateDto
} from '$core/distributives/types';

/** @internal Base API path for the distributives resource. */
const BASE = '/distributives';

/**
 * Namespace containing all API request methods for distributives.
 * Each method accepts the SvelteKit-provided `fetch` as its first argument.
 */
export const DISTRIBUTIVE_REQUEST = {
	// ── CRUD ─────────────────────────────────────

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

	// ── Queries ──────────────────────────────────

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
		getWithParams<CriteriaResult<Distributive>>(fetchFn, BASE, criteria),

	/**
	 * Retrieves distributives related by category for a given distributive.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Distributive ID.
	 */
	findGroupedByCategory: (
		fetchFn: typeof fetch,
		id: string
	): Promise<DistributiveGroupedByCategory[]> =>
		get<DistributiveGroupedByCategory[]>(fetchFn, `${BASE}/${id}/related-by-category`),

	/**
	 * Retrieves attractions related by location for a given distributive.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Distributive ID.
	 */
	findRelatedByAttractionLocation: (
		fetchFn: typeof fetch,
		id: string
	): Promise<DistributiveRelatedAttraction[]> =>
		get<DistributiveRelatedAttraction[]>(fetchFn, `${BASE}/${id}/related-by-attraction-location`),

	// ── Attractions ──────────────────────────────

	/**
	 * Adds an attraction to a distributive.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param distributiveId - Distributive ID.
	 * @param data - Attraction reference payload.
	 */
	addAttraction: (
		fetchFn: typeof fetch,
		distributiveId: string,
		data: DistributiveAttractionAddDto
	): Promise<void> => post(fetchFn, `${BASE}/${distributiveId}/attractions`, data),

	/**
	 * Removes an attraction from a distributive.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param distributiveId - Distributive ID.
	 * @param attractionId - Attraction ID to remove.
	 */
	removeAttraction: (
		fetchFn: typeof fetch,
		distributiveId: string,
		attractionId: string
	): Promise<void> => del(fetchFn, `${BASE}/${distributiveId}/attractions/${attractionId}`),

	// ── Categories ───────────────────────────────

	/**
	 * Adds a category to a distributive.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param distributiveId - Distributive ID.
	 * @param data - Category reference payload.
	 */
	addCategory: (
		fetchFn: typeof fetch,
		distributiveId: string,
		data: DistributiveCategoryAddDto
	): Promise<void> => post(fetchFn, `${BASE}/${distributiveId}/categories`, data),

	/**
	 * Removes a category from a distributive.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param distributiveId - Distributive ID.
	 * @param categoryId - Category ID to remove.
	 */
	removeCategory: (
		fetchFn: typeof fetch,
		distributiveId: string,
		categoryId: string
	): Promise<void> => del(fetchFn, `${BASE}/${distributiveId}/categories/${categoryId}`),

	// ── Locations ────────────────────────────────

	/**
	 * Adds a location to a distributive.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param distributiveId - Distributive ID.
	 * @param data - Location entity payload (id, locationId, role).
	 */
	addLocation: (
		fetchFn: typeof fetch,
		distributiveId: string,
		data: DistributiveLocationAddDto
	): Promise<void> => post(fetchFn, `${BASE}/${distributiveId}/locations`, data),

	/**
	 * Removes a location from a distributive.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param distributiveId - Distributive ID.
	 * @param locationId - Location entity ID to remove.
	 */
	removeLocation: (
		fetchFn: typeof fetch,
		distributiveId: string,
		locationId: string
	): Promise<void> => del(fetchFn, `${BASE}/${distributiveId}/locations/${locationId}`),

	// ── Content Blocks ───────────────────────────

	/**
	 * Adds a content block to a distributive.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param distributiveId - Distributive ID.
	 * @param data - Content block reference payload.
	 */
	addContentBlock: (
		fetchFn: typeof fetch,
		distributiveId: string,
		data: DistributiveContentBlockAddDto
	): Promise<void> => post(fetchFn, `${BASE}/${distributiveId}/content-blocks`, data),

	/**
	 * Removes a content block from a distributive.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param distributiveId - Distributive ID.
	 * @param contentBlockId - Content block ID to remove.
	 */
	removeContentBlock: (
		fetchFn: typeof fetch,
		distributiveId: string,
		contentBlockId: string
	): Promise<void> => del(fetchFn, `${BASE}/${distributiveId}/content-blocks/${contentBlockId}`)
};
