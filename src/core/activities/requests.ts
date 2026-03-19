/**
 * @module activities/requests
 * @description API request functions for the Activities resource.
 * Provides CRUD operations and sub-resource management (attractions, categories,
 * locations, distributives, meals, and stages).
 */

import type { CriteriaResult } from '$core/_shared/types';
import { get, getWithParams, post, put, patch, del } from '$core/_shared/helpers';
import type {
	Activity,
	ActivityAttractionAddDto,
	ActivityCategoryAddDto,
	ActivityContentBlockAddDto,
	ActivityCreateDto,
	ActivityCriteria,
	ActivityDistributiveAddDto,
	ActivityLocationAddDto,
	ActivityMealAddDto,
	ActivityStageAddDto,
	ActivityStageReorderDto,
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
	 * @param data - Attraction add payload.
	 */
	addAttraction: (
		fetchFn: typeof fetch,
		id: string,
		data: ActivityAttractionAddDto
	): Promise<void> => post(fetchFn, `${BASE}/${id}/attractions`, data),

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
	 * @param data - Category add payload.
	 */
	addCategory: (fetchFn: typeof fetch, id: string, data: ActivityCategoryAddDto): Promise<void> =>
		post(fetchFn, `${BASE}/${id}/categories`, data),

	/**
	 * Unlinks a category from an activity.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity ID.
	 * @param categoryId - Category ID to disassociate.
	 */
	removeCategory: (fetchFn: typeof fetch, id: string, categoryId: string): Promise<void> =>
		del(fetchFn, `${BASE}/${id}/categories/${categoryId}`),

	// ── Content Blocks ──────────────────────────

	/**
	 * Links a content block to an activity.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity ID.
	 * @param data - Content block add payload.
	 */
	addContentBlock: (
		fetchFn: typeof fetch,
		id: string,
		data: ActivityContentBlockAddDto
	): Promise<void> => post(fetchFn, `${BASE}/${id}/content-blocks`, data),

	/**
	 * Unlinks a content block from an activity.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity ID.
	 * @param contentBlockId - Content block ID to disassociate.
	 */
	removeContentBlock: (fetchFn: typeof fetch, id: string, contentBlockId: string): Promise<void> =>
		del(fetchFn, `${BASE}/${id}/content-blocks/${contentBlockId}`),

	// ── Locations ────────────────────────────────

	/**
	 * Adds a location to an activity.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity ID.
	 * @param data - Location add payload (includes locationId and role).
	 */
	addLocation: (fetchFn: typeof fetch, id: string, data: ActivityLocationAddDto): Promise<void> =>
		post(fetchFn, `${BASE}/${id}/locations`, data),

	/**
	 * Removes a location from an activity.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity ID.
	 * @param locationId - Location entity ID to remove.
	 */
	removeLocation: (fetchFn: typeof fetch, id: string, locationId: string): Promise<void> =>
		del(fetchFn, `${BASE}/${id}/locations/${locationId}`),

	// ── Distributives ────────────────────────────

	/**
	 * Links a distributive to an activity.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity ID.
	 * @param data - Distributive add payload.
	 */
	addDistributive: (
		fetchFn: typeof fetch,
		id: string,
		data: ActivityDistributiveAddDto
	): Promise<void> => post(fetchFn, `${BASE}/${id}/distributives`, data),

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
	 * @param data - Meal payload.
	 */
	addMeal: (fetchFn: typeof fetch, id: string, data: ActivityMealAddDto): Promise<void> =>
		post(fetchFn, `${BASE}/${id}/meals`, data),

	/**
	 * Removes a meal from an activity.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity ID.
	 * @param mealId - Meal ID to remove.
	 */
	removeMeal: (fetchFn: typeof fetch, id: string, mealId: string): Promise<void> =>
		del(fetchFn, `${BASE}/${id}/meals/${mealId}`),

	// ── Stages ───────────────────────────────────

	/**
	 * Adds a stage to an activity itinerary.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity ID.
	 * @param data - Stage payload.
	 */
	addStage: (fetchFn: typeof fetch, id: string, data: ActivityStageAddDto): Promise<void> =>
		post(fetchFn, `${BASE}/${id}/stages`, data),

	/**
	 * Reorders the stages of an activity.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity ID.
	 * @param data - Ordered list of stage IDs.
	 */
	reorderStages: (
		fetchFn: typeof fetch,
		id: string,
		data: ActivityStageReorderDto
	): Promise<void> => put(fetchFn, `${BASE}/${id}/stages/reorder`, data),

	/**
	 * Removes a stage from an activity itinerary.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Activity ID.
	 * @param stageId - Stage ID to remove.
	 */
	removeStage: (fetchFn: typeof fetch, id: string, stageId: string): Promise<void> =>
		del(fetchFn, `${BASE}/${id}/stages/${stageId}`)
};
