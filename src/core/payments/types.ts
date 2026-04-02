/**
 * @module payments/types
 * @description TypeScript type definitions for the Payments resource.
 * Organized into two sections:
 * - **Projections** (read models returned by the API)
 * - **Criteria** (query parameters for filtering and pagination)
 */

import type { PaymentMethod, PaymentSortAttribute, PaymentStatus } from '$core/payments/enums';
import type { CriteriaOperator, CriteriaSortOption } from '$core/_shared/enums';

// ── Projections (read models) ───────────────────

/** Full payment projection as returned by the API. */
export type Payment = {
	id: string;
	orderId: string;
	amount: number;
	createdAt: string;
	currency: string;
	errorMessage: string | null;
	externalId: string | null;
	metadata: Record<string, unknown>;
	paymentMethod: PaymentMethod;
	retries: number;
	status: PaymentStatus;
	updatedAt: string;
};

// ── Criteria (query params) ─────────────────────

/** Query parameters for filtering, sorting, and paginating payment lists. */
export type PaymentCriteria = {
	id?: string;
	orderId?: string;
	externalId?: string;
	retries?: number;
	status?: PaymentStatus[];
	skip?: number;
	limit?: number;
	sort?: PaymentSortAttribute;
	operator?: CriteriaOperator;
	order?: CriteriaSortOption;
};
