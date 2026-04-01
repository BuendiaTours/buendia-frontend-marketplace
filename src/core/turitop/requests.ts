/**
 * @module turitop/requests
 * @description API request functions for the TuriTop booking system integration.
 * All endpoints target the booking systems API (`PUBLIC_BS_BASE_URL`).
 */

import { bookingSystemsApi } from '$core/_shared/helpers';
import type {
	TuritopProduct,
	TuritopProductMappingDto,
	TuritopTicketMappingDto
} from '$core/turitop/types';

export const TURITOP_REQUEST = {
	// ── Product data ─────────────────────────────

	/**
	 * Fetches the TuriTop product data (tickets) for a core activity.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param coreActivityId - Core activity ID.
	 */
	fetchProduct: async (
		fetchFn: typeof fetch,
		coreActivityId: string
	): Promise<TuritopProduct | null> => {
		const result = await bookingSystemsApi.get<TuritopProduct[]>(
			fetchFn,
			`/core-activities/${coreActivityId}/booking-system`
		);
		return result.length > 0 ? result[0] : null;
	},

	// ── Product mapping ─────────────────────────

	/**
	 * Maps a TuriTop product to a core option.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param shortId - TuriTop product short ID.
	 * @param data - Mapping payload with coreId (option ID) and tenant.
	 */
	mapProduct: (
		fetchFn: typeof fetch,
		shortId: string,
		data: TuritopProductMappingDto
	): Promise<void> => bookingSystemsApi.post(fetchFn, `/turitop/products/${shortId}/mapping`, data),

	// ── Ticket mapping ──────────────────────────

	/**
	 * Maps a TuriTop ticket to a core ticket.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param turitopTicketId - TuriTop ticket ID.
	 * @param data - Mapping payload with coreId (ticket ID) and ticketScope.
	 */
	mapTicket: (
		fetchFn: typeof fetch,
		turitopTicketId: string,
		data: TuritopTicketMappingDto
	): Promise<void> =>
		bookingSystemsApi.post(fetchFn, `/turitop/tickets/${turitopTicketId}/mapping`, data),

	// ── Finish / Reset mapping ──────────────────

	/**
	 * Marks the mapping as complete.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param coreActivityId - Core activity ID.
	 */
	finishMapping: (fetchFn: typeof fetch, coreActivityId: string): Promise<void> =>
		bookingSystemsApi.post(fetchFn, `/core-activities/${coreActivityId}/mapping/finish`, {}),

	/**
	 * Resets all mappings for a core activity.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param coreActivityId - Core activity ID.
	 */
	resetMapping: (fetchFn: typeof fetch, coreActivityId: string): Promise<void> =>
		bookingSystemsApi.post(fetchFn, `/core-activities/${coreActivityId}/mapping/reset`, {})
};
