/**
 * @module activities/requests
 * @description API request functions for the Activities resource.
 * Provides CRUD operations and sub-resource management (attractions, categories,
 * destinations, distributives, meals, multimedia, and stages).
 */

import type { CriteriaResult } from '$core/_shared/types';
import { get, getWithParams, post, patch, del } from '$core/_shared/helpers';
import type {
	Activity,
	ActivityCreateDto,
	ActivityCriteria,
	ActivityMealAddDto,
	ActivityMultimediaAddDto,
	ActivityStageAddDto,
	ActivityUpdateDto
} from '$core/activities/types';

/** @internal Base API path for the activities resource. */
const BASE = '/activities';

/**
 * Namespace containing all API request methods for activities.
 * Each method accepts the SvelteKit-provided `fetch` as its first argument
 * to preserve SSR compatibility and cookie forwarding.
 */
export const ACTIVITY_REQUEST = {
	// ── CRUD ─────────────────────────────────────

	/**
	 * Creates a new activity.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param data - Activity creation payload.
	 */
	create: (fetchFn: typeof fetch, data: ActivityCreateDto): Promise<void> =>
		post(fetchFn, BASE, data),

	/**
	 * Partially updates an existing activity.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity ID.
	 * @param data - Fields to update.
	 */
	update: (fetchFn: typeof fetch, id: string, data: ActivityUpdateDto): Promise<void> =>
		patch(fetchFn, `${BASE}/${id}`, data),

	/**
	 * Deletes an activity by ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity ID.
	 */
	delete: (fetchFn: typeof fetch, id: string): Promise<void> => del(fetchFn, `${BASE}/${id}`),

	/**
	 * Retrieves a single activity by its ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity ID.
	 */
	findById: (fetchFn: typeof fetch, id: string): Promise<Activity> =>
		get<Activity>(fetchFn, `${BASE}/${id}`),

	/**
	 * Retrieves a single activity by its URL slug.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param slug - URL-friendly identifier.
	 */
	findBySlug: (fetchFn: typeof fetch, slug: string): Promise<Activity> =>
		get<Activity>(fetchFn, `${BASE}/slug/${slug}`),

	/**
	 * Queries activities using criteria-based filtering and pagination.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param criteria - Optional filter, sort, and pagination parameters.
	 */
	findByCriteria: (
		fetchFn: typeof fetch,
		criteria?: ActivityCriteria
	): Promise<CriteriaResult<Activity>> =>
		getWithParams<CriteriaResult<Activity>>(fetchFn, BASE, criteria),

	// ── Attractions ──────────────────────────────

	/**
	 * Links an attraction to an activity.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity ID.
	 * @param attractionId - Attraction ID to associate.
	 */
	addAttraction: (fetchFn: typeof fetch, id: string, attractionId: string): Promise<void> =>
		post(fetchFn, `${BASE}/${id}/attractions/${attractionId}`, {}),

	/**
	 * Unlinks an attraction from an activity.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity ID.
	 * @param attractionId - Attraction ID to disassociate.
	 */
	removeAttraction: (fetchFn: typeof fetch, id: string, attractionId: string): Promise<void> =>
		del(fetchFn, `${BASE}/${id}/attractions/${attractionId}`),

	// ── Categories ───────────────────────────────

	/**
	 * Links a category to an activity.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity ID.
	 * @param categoryId - Category ID to associate.
	 */
	addCategory: (fetchFn: typeof fetch, id: string, categoryId: string): Promise<void> =>
		post(fetchFn, `${BASE}/${id}/categories/${categoryId}`, {}),

	/**
	 * Unlinks a category from an activity.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity ID.
	 * @param categoryId - Category ID to disassociate.
	 */
	removeCategory: (fetchFn: typeof fetch, id: string, categoryId: string): Promise<void> =>
		del(fetchFn, `${BASE}/${id}/categories/${categoryId}`),

	// ── Destinations ─────────────────────────────

	/**
	 * Links a destination to an activity.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity ID.
	 * @param destinationId - Destination ID to associate.
	 */
	addDestination: (fetchFn: typeof fetch, id: string, destinationId: string): Promise<void> =>
		post(fetchFn, `${BASE}/${id}/destinations/${destinationId}`, {}),

	/**
	 * Unlinks a destination from an activity.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity ID.
	 * @param destinationId - Destination ID to disassociate.
	 */
	removeDestination: (fetchFn: typeof fetch, id: string, destinationId: string): Promise<void> =>
		del(fetchFn, `${BASE}/${id}/destinations/${destinationId}`),

	// ── Distributives ────────────────────────────

	/**
	 * Links a distributive to an activity.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity ID.
	 * @param distributiveId - Distributive ID to associate.
	 */
	addDistributive: (fetchFn: typeof fetch, id: string, distributiveId: string): Promise<void> =>
		post(fetchFn, `${BASE}/${id}/distributives/${distributiveId}`, {}),

	/**
	 * Unlinks a distributive from an activity.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity ID.
	 * @param distributiveId - Distributive ID to disassociate.
	 */
	removeDistributive: (fetchFn: typeof fetch, id: string, distributiveId: string): Promise<void> =>
		del(fetchFn, `${BASE}/${id}/distributives/${distributiveId}`),

	// ── Meals ────────────────────────────────────

	/**
	 * Adds a meal to an activity.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity ID.
	 * @param data - Meal payload (includes the meal ID).
	 */
	addMeal: (fetchFn: typeof fetch, id: string, data: ActivityMealAddDto): Promise<void> =>
		post(fetchFn, `${BASE}/${id}/meals/${data.id}`, data),

	/**
	 * Removes a meal from an activity.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity ID.
	 * @param mealId - Meal ID to remove.
	 */
	removeMeal: (fetchFn: typeof fetch, id: string, mealId: string): Promise<void> =>
		del(fetchFn, `${BASE}/${id}/meals/${mealId}`),

	// ── Multimedias ──────────────────────────────

	/**
	 * Adds a multimedia asset to an activity.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity ID.
	 * @param data - Multimedia payload (includes the multimedia ID).
	 */
	addMultimedia: (
		fetchFn: typeof fetch,
		id: string,
		data: ActivityMultimediaAddDto
	): Promise<void> => post(fetchFn, `${BASE}/${id}/multimedias/${data.id}`, data),

	/**
	 * Removes a multimedia asset from an activity.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity ID.
	 * @param multimediaId - Multimedia ID to remove.
	 */
	removeMultimedia: (fetchFn: typeof fetch, id: string, multimediaId: string): Promise<void> =>
		del(fetchFn, `${BASE}/${id}/multimedias/${multimediaId}`),

	// ── Stages ───────────────────────────────────

	/**
	 * Adds a stage to an activity itinerary.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity ID.
	 * @param data - Stage payload (includes the stage ID).
	 */
	addStage: (fetchFn: typeof fetch, id: string, data: ActivityStageAddDto): Promise<void> =>
		post(fetchFn, `${BASE}/${id}/stages/${data.id}`, data),

	/**
	 * Removes a stage from an activity itinerary.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity ID.
	 * @param stageId - Stage ID to remove.
	 */
	removeStage: (fetchFn: typeof fetch, id: string, stageId: string): Promise<void> =>
		del(fetchFn, `${BASE}/${id}/stages/${stageId}`)
};
