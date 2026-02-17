/**
 * @module categories/types
 * @description TypeScript type definitions for the Categories resource.
 * Organised into Projections (read), DTOs (write), and Criteria (query).
 */

import type { CategoryKind, CategorySortAttribute, CategoryStatus } from '$core/categories/enums';
import type { CriteriaOperator, CriteriaSortOption } from '$core/_shared/enums';

// ── Projection (read model) ─────────────────────

/** Full category projection as returned by the API. */
export type Category = {
	id: string;
	createdAt: string;
	description: string | null;
	kind: CategoryKind;
	label: string | null;
	name: string;
	slug: string;
	status: CategoryStatus;
	updatedAt: string;
};

// ── DTOs (write models) ─────────────────────────

/** Payload for creating a new category. */
export type CategoryCreateDto = {
	id: string;
	kind: CategoryKind;
	name: string;
	slug: string;
	status: CategoryStatus;
	description?: string | null;
	label?: string | null;
};

/** Payload for partially updating an existing category. */
export type CategoryUpdateDto = {
	description?: string | null;
	kind?: CategoryKind;
	label?: string | null;
	name?: string;
	slug?: string;
	status?: CategoryStatus;
};

// ── Criteria (query params) ─────────────────────

/** Query parameters for filtering, sorting, and paginating category lists. */
export type CategoryCriteria = {
	page?: number;
	pageSize?: number;
	name?: string;
	query?: string;
	slug?: string;
	status?: CategoryStatus;
	sort?: CategorySortAttribute;
	operator?: CriteriaOperator;
	order?: CriteriaSortOption;
};
