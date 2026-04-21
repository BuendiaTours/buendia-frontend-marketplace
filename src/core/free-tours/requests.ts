/**
 * @module free-tours/requests
 * @description API request functions for the Free Tours resource.
 * Provides CRUD operations, sub-resource management for entries and stages,
 * and criteria-based querying.
 */

import type { CriteriaResult } from '$core/_shared/types';
import { get, getWithParams, post, patch, del } from '$core/_shared/helpers';
import type {
	FreeTour,
	FreeTourCreateDto,
	FreeTourCreateFromActivityDto,
	FreeTourCriteria,
	FreeTourEntryAddDto,
	FreeTourPublishReadiness,
	FreeTourStageAddDto,
	FreeTourUpdateDto
} from '$core/free-tours/types';

/** @internal Base API path for the free tours resource. */
const BASE = '/free-tours';

/**
 * Namespace containing all API request methods for free tours.
 * Each method accepts the SvelteKit-provided `fetch` as its first argument.
 */
export const FREE_TOUR_REQUEST = {
	// ── CRUD ─────────────────────────────────────

	/**
	 * Creates a new free tour.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param data - Free tour creation payload.
	 */
	create: (fetchFn: typeof fetch, data: FreeTourCreateDto): Promise<void> =>
		post(fetchFn, BASE, data),

	/**
	 * Creates a new free tour seeded with the common attributes of an existing FREE_TOUR activity.
	 * The activity is automatically linked as the first entry of the new free tour.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param activityId - Source activity ID.
	 * @param data - Payload with the new free tour id and the entry id.
	 */
	createFromActivity: (
		fetchFn: typeof fetch,
		activityId: string,
		data: FreeTourCreateFromActivityDto
	): Promise<void> => post(fetchFn, `${BASE}/from-activity/${activityId}`, data),

	/**
	 * Partially updates an existing free tour.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Free tour ID.
	 * @param data - Fields to update.
	 */
	update: (fetchFn: typeof fetch, id: string, data: FreeTourUpdateDto): Promise<void> =>
		patch(fetchFn, `${BASE}/${id}`, data),

	/**
	 * Deletes a free tour by ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Free tour ID.
	 */
	delete: (fetchFn: typeof fetch, id: string): Promise<void> => del(fetchFn, `${BASE}/${id}`),

	// ── Queries ──────────────────────────────────

	/**
	 * Retrieves a single free tour by its ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Free tour ID.
	 */
	findById: (fetchFn: typeof fetch, id: string): Promise<FreeTour> =>
		get<FreeTour>(fetchFn, `${BASE}/${id}`),

	/**
	 * Queries free tours using criteria-based filtering and pagination.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param criteria - Optional filter, sort, and pagination parameters.
	 */
	findByCriteria: (
		fetchFn: typeof fetch,
		criteria?: FreeTourCriteria
	): Promise<CriteriaResult<FreeTour>> =>
		getWithParams<CriteriaResult<FreeTour>>(fetchFn, BASE, criteria),

	/**
	 * Checks whether a free tour meets all preconditions required to be published:
	 * has destinations, categories, media and at least one entry whose activity is
	 * in `GROUPED` status. Backoffice uses this to render the readiness checklist.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Free tour ID.
	 */
	checkPublishReadiness: (fetchFn: typeof fetch, id: string): Promise<FreeTourPublishReadiness> =>
		get<FreeTourPublishReadiness>(fetchFn, `${BASE}/${id}/publish-readiness`),

	// ── Entries (linked activities) ──────────────

	/**
	 * Adds an activity entry to a free tour.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param freeTourId - Free tour ID.
	 * @param data - Entry payload (id, activityId, priority).
	 */
	addEntry: (fetchFn: typeof fetch, freeTourId: string, data: FreeTourEntryAddDto): Promise<void> =>
		post(fetchFn, `${BASE}/${freeTourId}/entries`, data),

	/**
	 * Removes an activity entry from a free tour.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param freeTourId - Free tour ID.
	 * @param entryId - Entry ID to remove.
	 */
	removeEntry: (fetchFn: typeof fetch, freeTourId: string, entryId: string): Promise<void> =>
		del(fetchFn, `${BASE}/${freeTourId}/entries/${entryId}`),

	// ── Stages (itinerary) ──────────────────────

	/**
	 * Adds an itinerary stage to a free tour.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param freeTourId - Free tour ID.
	 * @param data - Stage payload (id, kind, duration, order, relevance, requirement, name?, coords?).
	 */
	addStage: (fetchFn: typeof fetch, freeTourId: string, data: FreeTourStageAddDto): Promise<void> =>
		post(fetchFn, `${BASE}/${freeTourId}/stages`, data),

	/**
	 * Removes an itinerary stage from a free tour.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param freeTourId - Free tour ID.
	 * @param stageId - Stage ID to remove.
	 */
	removeStage: (fetchFn: typeof fetch, freeTourId: string, stageId: string): Promise<void> =>
		del(fetchFn, `${BASE}/${freeTourId}/stages/${stageId}`)
};
