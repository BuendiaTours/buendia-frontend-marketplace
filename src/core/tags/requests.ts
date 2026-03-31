/**
 * @module tags/requests
 * @description API request functions for the Tags resource.
 * Provides standard CRUD operations and criteria-based querying.
 */

import type { CriteriaResult } from '$core/_shared/types';
import { get, getWithParams, post, patch, del } from '$core/_shared/helpers';
import type {
	Tag,
	TagCreateDto,
	TagCriteria,
	TagRelationship,
	TagRelationshipCreateDto,
	TagRelationshipCriteria,
	TagUpdateDto
} from '$core/tags/types';

/** @internal Base API path for the tags resource. */
const BASE = '/tags';

/**
 * Namespace containing all API request methods for tags.
 * Each method accepts the SvelteKit-provided `fetch` as its first argument.
 */
export const TAG_REQUEST = {
	/**
	 * Creates a new tag.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param data - Tag creation payload.
	 */
	create: (fetchFn: typeof fetch, data: TagCreateDto): Promise<void> => post(fetchFn, BASE, data),

	/**
	 * Partially updates an existing tag.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Tag ID.
	 * @param data - Fields to update.
	 */
	update: (fetchFn: typeof fetch, id: string, data: TagUpdateDto): Promise<void> =>
		patch(fetchFn, `${BASE}/${id}`, data),

	/**
	 * Deletes a tag by ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Tag ID.
	 */
	delete: (fetchFn: typeof fetch, id: string): Promise<void> => del(fetchFn, `${BASE}/${id}`),

	/**
	 * Retrieves a single tag by its ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Tag ID.
	 */
	findById: (fetchFn: typeof fetch, id: string): Promise<Tag> => get<Tag>(fetchFn, `${BASE}/${id}`),

	/**
	 * Queries tags using criteria-based filtering and pagination.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param criteria - Optional filter, sort, and pagination parameters.
	 */
	findByCriteria: (fetchFn: typeof fetch, criteria?: TagCriteria): Promise<CriteriaResult<Tag>> =>
		getWithParams<CriteriaResult<Tag>>(fetchFn, BASE, criteria)
};

// ── Tag Relationship ───────────────────────────

/** @internal Base API path for the tag relationship resource. */
const TAG_RELATIONSHIP_BASE = '/tags-relationship';

/**
 * Namespace containing all API request methods for tag relationships.
 * Each method accepts the SvelteKit-provided `fetch` as its first argument.
 */
export const TAG_RELATIONSHIP_REQUEST = {
	/**
	 * Creates a new tag relationship.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param data - Tag relationship creation payload.
	 */
	create: (fetchFn: typeof fetch, data: TagRelationshipCreateDto): Promise<void> =>
		post(fetchFn, TAG_RELATIONSHIP_BASE, data),

	/**
	 * Deletes a tag relationship by ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Tag relationship ID.
	 */
	delete: (fetchFn: typeof fetch, id: string): Promise<void> =>
		del(fetchFn, `${TAG_RELATIONSHIP_BASE}/${id}`),

	/**
	 * Retrieves a single tag relationship by its ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Tag relationship ID.
	 */
	findById: (fetchFn: typeof fetch, id: string): Promise<TagRelationship> =>
		get<TagRelationship>(fetchFn, `${TAG_RELATIONSHIP_BASE}/${id}`),

	/**
	 * Queries tag relationships using criteria-based filtering and pagination.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param criteria - Optional filter, sort, and pagination parameters.
	 */
	findByCriteria: (
		fetchFn: typeof fetch,
		criteria?: TagRelationshipCriteria
	): Promise<CriteriaResult<TagRelationship>> =>
		getWithParams<CriteriaResult<TagRelationship>>(fetchFn, TAG_RELATIONSHIP_BASE, criteria)
};
