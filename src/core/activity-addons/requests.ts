/**
 * @module activity-addons/requests
 * @description API request functions for the Activity Addons resource.
 * Provides standard CRUD operations, criteria-based querying,
 * and activity-option assignment management.
 */

import type { CriteriaResult } from '$core/_shared/types';
import { get, getWithParams, post, patch, del } from '$core/_shared/helpers';
import type {
	ActivityAddon,
	ActivityAddonActivityOptionAssignDto,
	ActivityAddonCreateDto,
	ActivityAddonCriteria,
	ActivityAddonUpdateDto
} from '$core/activity-addons/types';

/** @internal Base API path for the activity-addons resource. */
const BASE = '/activity-addons';

/**
 * Namespace containing all API request methods for activity addons.
 * Each method accepts the SvelteKit-provided `fetch` as its first argument.
 */
export const ACTIVITY_ADDON_REQUEST = {
	/**
	 * Creates a new addon.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param data - Addon creation payload.
	 */
	create: (fetchFn: typeof fetch, data: ActivityAddonCreateDto): Promise<void> =>
		post(fetchFn, BASE, data),

	/**
	 * Partially updates an existing addon.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Addon ID.
	 * @param data - Fields to update.
	 */
	update: (fetchFn: typeof fetch, id: string, data: ActivityAddonUpdateDto): Promise<void> =>
		patch(fetchFn, `${BASE}/${id}`, data),

	/**
	 * Deletes an addon by ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Addon ID.
	 */
	delete: (fetchFn: typeof fetch, id: string): Promise<void> => del(fetchFn, `${BASE}/${id}`),

	/**
	 * Retrieves a single addon by its ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Addon ID.
	 */
	findById: (fetchFn: typeof fetch, id: string): Promise<ActivityAddon> =>
		get<ActivityAddon>(fetchFn, `${BASE}/${id}`),

	/**
	 * Queries addons using criteria-based filtering and pagination.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param criteria - Optional filter, sort, and pagination parameters.
	 */
	findByCriteria: (
		fetchFn: typeof fetch,
		criteria?: ActivityAddonCriteria
	): Promise<CriteriaResult<ActivityAddon>> =>
		getWithParams<CriteriaResult<ActivityAddon>>(fetchFn, BASE, criteria),

	/**
	 * Assigns an addon to an activity option.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Addon ID.
	 * @param data - Activity option assignment payload.
	 */
	assignToActivityOption: (
		fetchFn: typeof fetch,
		id: string,
		data: ActivityAddonActivityOptionAssignDto
	): Promise<void> => post(fetchFn, `${BASE}/${id}/activity-options`, data),

	/**
	 * Unassigns an addon from an activity option.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Addon ID.
	 * @param activityOptionId - Activity option ID to unassign.
	 */
	unassignFromActivityOption: (
		fetchFn: typeof fetch,
		id: string,
		activityOptionId: string
	): Promise<void> => del(fetchFn, `${BASE}/${id}/activity-options/${activityOptionId}`)
};
