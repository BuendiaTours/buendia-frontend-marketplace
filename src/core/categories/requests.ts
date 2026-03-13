/**
 * @module categories/requests
 * @description API request functions for the Categories resource.
 * Provides standard CRUD operations and criteria-based querying.
 */

import type { CriteriaResult } from '$core/_shared/types';
import { get, getWithParams, post, patch, del } from '$core/_shared/helpers';
import type {
	Category,
	CategoryCreateDto,
	CategoryCriteria,
	CategoryUpdateDto
} from '$core/categories/types';

/** @internal Base API path for the categories resource. */
const BASE = '/categories';

/**
 * Namespace containing all API request methods for categories.
 * Each method accepts the SvelteKit-provided `fetch` as its first argument.
 */
export const CATEGORY_REQUEST = {
	/**
	 * Creates a new category.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param data - Category creation payload.
	 */
	create: (fetchFn: typeof fetch, data: CategoryCreateDto): Promise<void> =>
		post(fetchFn, BASE, data),

	/**
	 * Partially updates an existing category.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Category ID.
	 * @param data - Fields to update.
	 */
	update: (fetchFn: typeof fetch, id: string, data: CategoryUpdateDto): Promise<void> =>
		patch(fetchFn, `${BASE}/${id}`, data),

	/**
	 * Deletes a category by ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Category ID.
	 */
	delete: (fetchFn: typeof fetch, id: string): Promise<void> => del(fetchFn, `${BASE}/${id}`),

	/**
	 * Retrieves a single category by its ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Category ID.
	 */
	findById: (fetchFn: typeof fetch, id: string): Promise<Category> =>
		get<Category>(fetchFn, `${BASE}/${id}`),

	/**
	 * Queries categories using criteria-based filtering and pagination.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param criteria - Optional filter, sort, and pagination parameters.
	 */
	findByCriteria: (
		fetchFn: typeof fetch,
		criteria?: CategoryCriteria
	): Promise<CriteriaResult<Category>> =>
		getWithParams<CriteriaResult<Category>>(fetchFn, BASE, criteria)
};
