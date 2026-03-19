/**
 * @module pickup-points/requests
 * @description API request functions for the Pickup Points resource.
 * Provides CRUD operations for pickup points.
 */

import type { CriteriaResult } from '$core/_shared/types';
import { get, getWithParams, post, patch, del } from '$core/_shared/helpers';
import type {
	PickupPoint,
	PickupPointCreateDto,
	PickupPointCriteria,
	PickupPointUpdateDto
} from '$core/pickup-points/types';

/** @internal Base API path for the pickup points resource. */
const BASE = '/pickup_points';

/**
 * Namespace containing all API request methods for pickup points.
 * Each method accepts the SvelteKit-provided `fetch` as its first argument
 * to preserve SSR compatibility and cookie forwarding.
 */
export const PICKUP_POINT_REQUEST = {
	// ── CRUD ─────────────────────────────────────

	/**
	 * Creates a new pickup point.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param data - Pickup point creation payload.
	 */
	create: (fetchFn: typeof fetch, data: PickupPointCreateDto): Promise<void> =>
		post(fetchFn, BASE, data),

	/**
	 * Partially updates an existing pickup point.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Pickup point ID.
	 * @param data - Fields to update.
	 */
	update: (fetchFn: typeof fetch, id: string, data: PickupPointUpdateDto): Promise<void> =>
		patch(fetchFn, `${BASE}/${id}`, data),

	/**
	 * Deletes a pickup point by ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Pickup point ID.
	 */
	delete: (fetchFn: typeof fetch, id: string): Promise<void> => del(fetchFn, `${BASE}/${id}`),

	/**
	 * Retrieves a single pickup point by its ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Pickup point ID.
	 */
	findById: (fetchFn: typeof fetch, id: string): Promise<PickupPoint> =>
		get<PickupPoint>(fetchFn, `${BASE}/${id}`),

	/**
	 * Queries pickup points using criteria-based filtering and pagination.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param criteria - Optional filter, sort, and pagination parameters.
	 */
	findByCriteria: (
		fetchFn: typeof fetch,
		criteria?: PickupPointCriteria
	): Promise<CriteriaResult<PickupPoint>> =>
		getWithParams<CriteriaResult<PickupPoint>>(fetchFn, BASE, criteria)
};
