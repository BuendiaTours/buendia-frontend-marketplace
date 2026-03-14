/**
 * @module suppliers/requests
 * @description API request functions for the Suppliers resource.
 * Provides standard CRUD operations and criteria-based querying.
 */

import type { CriteriaResult } from '$core/_shared/types';
import { get, getWithParams, post, patch, del } from '$core/_shared/helpers';
import type {
	Supplier,
	SupplierCreateDto,
	SupplierCriteria,
	SupplierUpdateDto
} from '$core/suppliers/types';

/** @internal Base API path for the suppliers resource. */
const BASE = '/suppliers';

/**
 * Namespace containing all API request methods for suppliers.
 * Each method accepts the SvelteKit-provided `fetch` as its first argument.
 */
export const SUPPLIER_REQUEST = {
	/**
	 * Creates a new supplier.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param data - Supplier creation payload.
	 */
	create: (fetchFn: typeof fetch, data: SupplierCreateDto): Promise<void> =>
		post(fetchFn, BASE, data),

	/**
	 * Partially updates an existing supplier.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Supplier ID.
	 * @param data - Fields to update.
	 */
	update: (fetchFn: typeof fetch, id: string, data: SupplierUpdateDto): Promise<void> =>
		patch(fetchFn, `${BASE}/${id}`, data),

	/**
	 * Deletes a supplier by ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Supplier ID.
	 */
	delete: (fetchFn: typeof fetch, id: string): Promise<void> => del(fetchFn, `${BASE}/${id}`),

	/**
	 * Retrieves a single supplier by its ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Supplier ID.
	 */
	findById: (fetchFn: typeof fetch, id: string): Promise<Supplier> =>
		get<Supplier>(fetchFn, `${BASE}/${id}`),

	/**
	 * Queries suppliers using criteria-based filtering and pagination.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param criteria - Optional filter, sort, and pagination parameters.
	 */
	findByCriteria: (
		fetchFn: typeof fetch,
		criteria?: SupplierCriteria
	): Promise<CriteriaResult<Supplier>> =>
		getWithParams<CriteriaResult<Supplier>>(fetchFn, BASE, criteria)
};
