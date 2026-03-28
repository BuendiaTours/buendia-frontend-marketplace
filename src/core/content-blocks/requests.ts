/**
 * @module content-blocks/requests
 * @description API request functions for the Content Blocks resource.
 * Provides CRUD operations and criteria-based querying.
 */

import type { CriteriaResult } from '$core/_shared/types';
import { get, getWithParams, post, patch, del } from '$core/_shared/helpers';
import type {
	ContentBlock,
	ContentBlockCreateDto,
	ContentBlockCriteria,
	ContentBlockUpdateDto
} from '$core/content-blocks/types';

/** @internal Base API path for the content block resource. */
const BASE = '/content-block';

/**
 * Namespace containing all API request methods for content blocks.
 * Each method accepts the SvelteKit-provided `fetch` as its first argument
 * to preserve SSR compatibility and cookie forwarding.
 */
export const CONTENT_BLOCK_REQUEST = {
	/**
	 * Creates a new content block.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param data - Content block creation payload.
	 */
	create: (fetchFn: typeof fetch, data: ContentBlockCreateDto): Promise<void> =>
		post(fetchFn, BASE, data),

	/**
	 * Partially updates an existing content block.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Content block ID.
	 * @param data - Fields to update.
	 */
	update: (fetchFn: typeof fetch, id: string, data: ContentBlockUpdateDto): Promise<void> =>
		patch(fetchFn, `${BASE}/${id}`, data),

	/**
	 * Deletes a content block by ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Content block ID.
	 */
	delete: (fetchFn: typeof fetch, id: string): Promise<void> => del(fetchFn, `${BASE}/${id}`),

	/**
	 * Retrieves a single content block by its ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Content block ID.
	 */
	findById: (fetchFn: typeof fetch, id: string): Promise<ContentBlock> =>
		get<ContentBlock>(fetchFn, `${BASE}/${id}`),

	/**
	 * Queries content blocks using criteria-based filtering and pagination.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param criteria - Optional filter, sort, and pagination parameters.
	 */
	findByCriteria: (
		fetchFn: typeof fetch,
		criteria?: ContentBlockCriteria
	): Promise<CriteriaResult<ContentBlock>> =>
		getWithParams<CriteriaResult<ContentBlock>>(fetchFn, BASE, criteria)
};
