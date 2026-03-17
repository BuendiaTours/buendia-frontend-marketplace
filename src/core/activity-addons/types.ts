/**
 * @module activity-addons/types
 * @description TypeScript type definitions for the Activity Addons resource.
 * Organised into Projections (read), DTOs (write), and Criteria (query).
 */

import type { ActivityAddonOptionKind } from '$core/activity-addons/enums';
import type { CriteriaOperator, CriteriaSortOption } from '$core/_shared/enums';

// ── Projections (read models) ───────────────────

/** Activity option link embedded within an addon. */
export type ActivityAddonActivityOption = {
	activityOptionId: string;
	kind: ActivityAddonOptionKind;
};

/** Full addon projection as returned by the API. */
export type ActivityAddon = {
	id: string;
	activityId: string;
	activityOptions: ActivityAddonActivityOption[];
	basePrice: number;
	createdAt: string;
	maxPerBooking: number | null;
	name: string;
	updatedAt: string;
};

// ── DTOs (write models) ─────────────────────────

/** Payload for creating a new addon. */
export type ActivityAddonCreateDto = {
	id: string;
	activityId: string;
	basePrice: number;
	name: string;
	maxPerBooking?: number;
};

/** Payload for partially updating an existing addon. */
export type ActivityAddonUpdateDto = {
	basePrice?: number;
	maxPerBooking?: number;
	name?: string;
};

/** Payload for assigning an addon to an activity option. */
export type ActivityAddonActivityOptionAssignDto = {
	activityOptionId: string;
	kind: ActivityAddonOptionKind;
};

// ── Criteria (query params) ─────────────────────

/** Query parameters for filtering, sorting, and paginating addon lists. */
export type ActivityAddonCriteria = {
	activityId?: string;
	name?: string;
	search_text?: string;
	skip?: number;
	limit?: number;
	operator?: CriteriaOperator;
	order?: CriteriaSortOption;
};
