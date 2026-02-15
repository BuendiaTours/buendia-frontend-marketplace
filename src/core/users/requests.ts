/**
 * @module users/requests
 * @description API request functions for the Users resource.
 * Provides create, update, find-by-ID, and criteria-based querying.
 * Note: users are not deletable through this API.
 */

import type { CriteriaResult } from '$core/_shared/types';
import { get, getWithParams, post, patch } from '$core/_shared/helpers';
import type { User, UserCreateDto, UserUpdateDto, UserCriteria } from '$core/users/types';

/** @internal Base API path for the users resource. */
const BASE = '/users';

/**
 * Namespace containing all API request methods for users.
 * Each method accepts the SvelteKit-provided `fetch` as its first argument.
 */
export const USER_REQUEST = {
	/**
	 * Creates a new user.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param data - User creation payload.
	 */
	create: (fetchFn: typeof fetch, data: UserCreateDto): Promise<void> => post(fetchFn, BASE, data),

	/**
	 * Partially updates an existing user.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - User ID.
	 * @param data - Fields to update.
	 */
	update: (fetchFn: typeof fetch, id: string, data: UserUpdateDto): Promise<void> =>
		patch(fetchFn, `${BASE}/${id}`, data),

	/**
	 * Retrieves a single user by their ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - User ID.
	 */
	findById: (fetchFn: typeof fetch, id: string): Promise<User> =>
		get<User>(fetchFn, `${BASE}/${id}`),

	/**
	 * Queries users using criteria-based filtering and pagination.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param criteria - Optional filter, sort, and pagination parameters.
	 */
	findByCriteria: (fetchFn: typeof fetch, criteria?: UserCriteria): Promise<CriteriaResult<User>> =>
		getWithParams<CriteriaResult<User>>(fetchFn, BASE, criteria)
};
