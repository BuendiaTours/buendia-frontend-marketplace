/**
 * @module tags/types
 * @description TypeScript type definitions for the Tags resource.
 * Organised into Projections (read), DTOs (write), and Criteria (query).
 */

import type {
	TagRelationshipKind,
	TagRelationshipSortAttribute,
	TagSortAttribute
} from '$core/tags/enums';
import type { CriteriaOperator, CriteriaSortOption } from '$core/_shared/enums';

// ── Projection (read model) ─────────────────────

/** Full tag projection as returned by the API. */
export type Tag = {
	id: string;
	name: string;
};

// ── DTOs (write models) ─────────────────────────

/** Payload for creating a new tag. */
export type TagCreateDto = {
	id: string;
	name: string;
};

/** Payload for updating an existing tag. */
export type TagUpdateDto = {
	name: string;
};

// ── Criteria (query params) ─────────────────────

/** Query parameters for filtering, sorting, and paginating tag lists. */
export type TagCriteria = {
	page?: number;
	pageSize?: number;
	id?: string;
	name?: string;
	search_text?: string;
	sort?: TagSortAttribute;
	operator?: CriteriaOperator;
	order?: CriteriaSortOption;
};

// ── Tag Relationship ───────────────────────────

// ── Projection (read model) ─────────────────────

/** Full tag relationship projection as returned by the API. */
export type TagRelationship = {
	id: string;
	entityId: string;
	kind: TagRelationshipKind;
	tagId: string;
};

// ── DTOs (write models) ─────────────────────────

/** Payload for creating a new tag relationship. */
export type TagRelationshipCreateDto = {
	id: string;
	entityId: string;
	kind: TagRelationshipKind;
	tagId: string;
};

// ── Criteria (query params) ─────────────────────

/** Query parameters for filtering, sorting, and paginating tag relationship lists. */
export type TagRelationshipCriteria = {
	entityId?: string;
	id?: string;
	kind?: string;
	tagId?: string;
	sort?: TagRelationshipSortAttribute;
	operator?: CriteriaOperator;
	order?: CriteriaSortOption;
	skip?: number;
	limit?: number;
};
