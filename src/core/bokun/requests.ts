/**
 * @module bokun/requests
 * @description API request functions for the Bokun booking system integration.
 * All endpoints target the booking systems API (`PUBLIC_BS_BASE_URL`).
 * Provides rate mapping, pricing category mapping, and finish mapping.
 */

import { bookingSystemsApi } from '$core/_shared/helpers';
import type {
	BokunActivity,
	BokunPricingCategoryMapping,
	BokunRateMappingDto,
	BokunPricingCategoryMappingDto
} from '$core/bokun/types';

/**
 * Namespace containing all API request methods for the Bokun integration.
 * Each method accepts the SvelteKit-provided `fetch` as its first argument.
 */
export const BOKUN_REQUEST = {
	// ── Activity data ────────────────────────────

	/**
	 * Fetches the Bokun activity data (rates, pricing categories) for a core activity.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param coreActivityId - Core activity ID.
	 */
	fetchActivity: async (
		fetchFn: typeof fetch,
		coreActivityId: string
	): Promise<BokunActivity | null> => {
		const result = await bookingSystemsApi.get<BokunActivity[]>(
			fetchFn,
			`/core-activities/${coreActivityId}/booking-system`
		);
		return result.length > 0 ? result[0] : null;
	},

	/**
	 * Fetches pricing category mappings for a Bokun activity.
	 * Returns which pricing categories are already mapped to core tickets.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param bokunActivityId - Bokun activity ID (numeric).
	 */
	fetchPricingCategoryMappings: (
		fetchFn: typeof fetch,
		bokunActivityId: number
	): Promise<BokunPricingCategoryMapping[]> =>
		bookingSystemsApi.get<BokunPricingCategoryMapping[]>(
			fetchFn,
			`/bokun/pricing-categories/activity/${bokunActivityId}`
		),

	// ── Rate mapping ────────────────────────────

	/**
	 * Maps a Bokun rate to a core option.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param rateId - Bokun rate ID.
	 * @param data - Mapping payload with coreId (option ID).
	 */
	mapRate: (fetchFn: typeof fetch, rateId: number, data: BokunRateMappingDto): Promise<void> =>
		bookingSystemsApi.post(fetchFn, `/bokun/rates/${rateId}/mapping`, data),

	// ── Pricing category mapping ────────────────

	/**
	 * Maps a Bokun pricing category to a core ticket.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param pricingCategoryId - Bokun pricing category ID.
	 * @param data - Mapping payload with coreId (ticket ID), activityId, rateId, ticketScope.
	 */
	mapPricingCategory: (
		fetchFn: typeof fetch,
		pricingCategoryId: number,
		data: BokunPricingCategoryMappingDto
	): Promise<void> =>
		bookingSystemsApi.post(fetchFn, `/bokun/pricing-categories/${pricingCategoryId}/mapping`, data),

	// ── Finish mapping ──────────────────────────

	/**
	 * Marks the mapping as complete, transitioning the activity to COMPLETED status.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param coreActivityId - Core activity ID.
	 */
	finishMapping: (fetchFn: typeof fetch, coreActivityId: string): Promise<void> =>
		bookingSystemsApi.post(fetchFn, `/core-activities/${coreActivityId}/mapping/finish`, {}),

	/**
	 * Resets all mappings for a core activity, reverting the integration.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param coreActivityId - Core activity ID.
	 */
	resetMapping: (fetchFn: typeof fetch, coreActivityId: string): Promise<void> =>
		bookingSystemsApi.post(fetchFn, `/core-activities/${coreActivityId}/mapping/reset`, {})
};
