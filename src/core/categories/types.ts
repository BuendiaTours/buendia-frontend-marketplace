/**
 * @module categories/types
 * @description TypeScript type definitions for the Categories resource.
 * Organised into Projections (read), DTOs (write), and Criteria (query).
 */

import type { CategorySortAttribute, CategoryStatus } from '$core/categories/enums';
import type { CriteriaOperator, CriteriaSortOption } from '$core/_shared/enums';

// ── Projection (read model) ─────────────────────

/** Full category projection as returned by the API. */
export type Category = {
	id: string;
	createdAt: string;
	description: string | null;
	name: string;
	status: CategoryStatus;
	updatedAt: string;
};

// ── DTOs (write models) ─────────────────────────

/** Payload for creating a new category. */
export type CategoryCreateDto = {
	id: string;
	name: string;
	status: CategoryStatus;
	description?: string;
};

/** Payload for partially updating an existing category. */
export type CategoryUpdateDto = {
	description?: string;
	name?: string;
	status?: CategoryStatus;
};

// ── Criteria (query params) ─────────────────────

/** Query parameters for filtering, sorting, and paginating category lists. */
export type CategoryCriteria = {
	skip?: number;
	limit?: number;
	name?: string;
	query?: string;
	status?: CategoryStatus;
	sort?: CategorySortAttribute;
	operator?: CriteriaOperator;
	order?: CriteriaSortOption;
};
