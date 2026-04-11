/**
 * @module faqs/types
 * @description TypeScript type definitions for the FAQs and FAQ Relationships resources.
 * Organized into three sections:
 * - **Projections** (read models returned by the API)
 * - **DTOs** (write models sent to the API)
 * - **Criteria** (query parameters for filtering and pagination)
 */

import type {
	FaqRelationshipEntityType,
	FaqRelationshipSort,
	FaqScopeFilter,
	FaqSort,
	FaqStatus
} from '$core/faqs/enums';
import type { CriteriaOperator, CriteriaSortOption } from '$core/_shared/enums';

// ── Projections (read models) ───────────────────

/** Full FAQ projection as returned by the API. */
export type Faq = {
	id: string;
	activityId: string | null;
	answer: string;
	question: string;
	status: FaqStatus;
	createdAt: string;
	updatedAt: string;
};

/** Full FAQ relationship projection as returned by the API. */
export type FaqRelationship = {
	id: string;
	entityId: string;
	faqId: string;
	entityType: FaqRelationshipEntityType;
	position: number;
	createdAt: string;
	updatedAt: string;
};

// ── DTOs (write models) ─────────────────────────

/** Payload for creating a new FAQ. */
export type FaqCreateDto = {
	id: string;
	activityId?: string;
	answer: string;
	question: string;
};

/** Payload for partially updating an existing FAQ. */
export type FaqUpdateDto = {
	answer?: string;
	question?: string;
	status?: FaqStatus;
};

/** Payload for creating a new FAQ relationship. */
export type FaqRelationshipCreateDto = {
	id: string;
	entityId: string;
	faqId: string;
	entityType: FaqRelationshipEntityType;
};

/** Single item in a FAQ relationship reorder request. */
export type FaqRelationshipReorderItem = {
	id: string;
	position: number;
};

/** Payload for reordering FAQ relationships. */
export type FaqRelationshipReorderDto = {
	items: FaqRelationshipReorderItem[];
};

// ── Criteria (query params) ─────────────────────

/** Query parameters for filtering, sorting, and paginating FAQ lists. */
export type FaqCriteria = {
	skip?: number;
	limit?: number;
	id?: string;
	scope?: FaqScopeFilter;
	status?: FaqStatus;
	sort?: FaqSort;
	operator?: CriteriaOperator;
	order?: CriteriaSortOption;
};

/** Query parameters for filtering, sorting, and paginating FAQ relationship lists. */
export type FaqRelationshipCriteria = {
	skip?: number;
	limit?: number;
	entityId?: string;
	entityType?: FaqRelationshipEntityType;
	faqId?: string;
	sort?: FaqRelationshipSort;
	operator?: CriteriaOperator;
	order?: CriteriaSortOption;
};
