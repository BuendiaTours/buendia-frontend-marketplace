/**
 * @module payments/requests
 * @description API request functions for the Payments resource.
 * Provides read-only operations for payment visualization.
 */

import type { CriteriaResult } from '$core/_shared/types';
import { get, getWithParams } from '$core/_shared/helpers';
import type { Payment, PaymentCriteria } from '$core/payments/types';

/** @internal Base API path for the payments resource. */
const BASE = '/payments';

/**
 * Namespace containing all API request methods for payments.
 * Each method accepts the SvelteKit-provided `fetch` as its first argument
 * to preserve SSR compatibility and cookie forwarding.
 */
export const PAYMENT_REQUEST = {
	// ── Queries ──────────────────────────────────

	/**
	 * Retrieves a single payment by its ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Payment ID.
	 */
	findById: (fetchFn: typeof fetch, id: string): Promise<Payment> =>
		get<Payment>(fetchFn, `${BASE}/${id}`),

	/**
	 * Queries payments using criteria-based filtering and pagination.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param criteria - Optional filter, sort, and pagination parameters.
	 */
	findByCriteria: (
		fetchFn: typeof fetch,
		criteria?: PaymentCriteria
	): Promise<CriteriaResult<Payment>> =>
		getWithParams<CriteriaResult<Payment>>(fetchFn, BASE, criteria)
};
