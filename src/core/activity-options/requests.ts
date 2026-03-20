/**
 * @module activity-options/requests
 * @description API request functions for the Activity Options resource.
 * Provides CRUD operations and sub-resource management (individual tickets,
 * group tickets, and pickup places).
 */

import type { CriteriaResult } from '$core/_shared/types';
import { get, getWithParams, post, patch, del } from '$core/_shared/helpers';
import type {
	ActivityOption,
	ActivityOptionCreateDto,
	ActivityOptionCriteria,
	ActivityOptionUpdateDto,
	GroupTicketAddDto,
	IndividualTicketAddDto,
	PickupPlaceAddDto
} from '$core/activity-options/types';

/** @internal Base API path for the activity options resource. */
const BASE = '/activity-options';

/**
 * Namespace containing all API request methods for activity options.
 * Each method accepts the SvelteKit-provided `fetch` as its first argument
 * to preserve SSR compatibility and cookie forwarding.
 */
export const ACTIVITY_OPTION_REQUEST = {
	// ── CRUD ─────────────────────────────────────

	/**
	 * Creates a new activity option.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param data - Activity option creation payload.
	 */
	create: (fetchFn: typeof fetch, data: ActivityOptionCreateDto): Promise<void> =>
		post(fetchFn, BASE, data),

	/**
	 * Partially updates an existing activity option.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity option ID.
	 * @param data - Fields to update.
	 */
	update: (fetchFn: typeof fetch, id: string, data: ActivityOptionUpdateDto): Promise<void> =>
		patch(fetchFn, `${BASE}/${id}`, data),

	/**
	 * Retrieves a single activity option by its ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity option ID.
	 */
	findById: (fetchFn: typeof fetch, id: string): Promise<ActivityOption> =>
		get<ActivityOption>(fetchFn, `${BASE}/${id}`),

	/**
	 * Retrieves activity options by their parent activity ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param activityId - Parent activity ID.
	 */
	findByActivityId: (fetchFn: typeof fetch, activityId: string): Promise<ActivityOption[]> =>
		get<ActivityOption[]>(fetchFn, `${BASE}/by-activity/${activityId}`),

	/**
	 * Queries activity options using criteria-based filtering and pagination.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param criteria - Optional filter, sort, and pagination parameters.
	 */
	findByCriteria: (
		fetchFn: typeof fetch,
		criteria?: ActivityOptionCriteria
	): Promise<CriteriaResult<ActivityOption>> =>
		getWithParams<CriteriaResult<ActivityOption>>(fetchFn, BASE, criteria),

	// ── Individual Tickets ───────────────────────

	/**
	 * Adds an individual ticket to an activity option.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity option ID.
	 * @param data - Individual ticket payload.
	 */
	addIndividualTicket: (
		fetchFn: typeof fetch,
		id: string,
		data: IndividualTicketAddDto
	): Promise<void> => post(fetchFn, `${BASE}/${id}/individual-tickets`, data),

	/**
	 * Removes an individual ticket from an activity option.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity option ID.
	 * @param ticketId - Individual ticket ID to remove.
	 */
	removeIndividualTicket: (fetchFn: typeof fetch, id: string, ticketId: string): Promise<void> =>
		del(fetchFn, `${BASE}/${id}/individual-tickets/${ticketId}`),

	// ── Group Tickets ───────────────────────────

	/**
	 * Adds a group ticket to an activity option.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity option ID.
	 * @param data - Group ticket payload.
	 */
	addGroupTicket: (fetchFn: typeof fetch, id: string, data: GroupTicketAddDto): Promise<void> =>
		post(fetchFn, `${BASE}/${id}/group-tickets`, data),

	/**
	 * Removes a group ticket from an activity option.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity option ID.
	 * @param ticketId - Group ticket ID to remove.
	 */
	removeGroupTicket: (fetchFn: typeof fetch, id: string, ticketId: string): Promise<void> =>
		del(fetchFn, `${BASE}/${id}/group-tickets/${ticketId}`),

	// ── Pickup Places ───────────────────────────

	/**
	 * Adds a pickup place to an activity option.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity option ID.
	 * @param data - Pickup place payload.
	 */
	addPickupPlace: (fetchFn: typeof fetch, id: string, data: PickupPlaceAddDto): Promise<void> =>
		post(fetchFn, `${BASE}/${id}/pickup-places`, data),

	/**
	 * Removes a pickup place from an activity option.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity option ID.
	 * @param pickupLocationId - Pickup location ID to remove.
	 * @param kind - Kind of pickup place (PICKUP or DROPOFF).
	 */
	removePickupPlace: (
		fetchFn: typeof fetch,
		id: string,
		pickupLocationId: string,
		kind: string
	): Promise<void> => del(fetchFn, `${BASE}/${id}/pickup-places/${pickupLocationId}?kind=${kind}`)
};
