/**
 * @module content-blocks/types
 * @description TypeScript type definitions for the Content Blocks resource.
 * Organized into three sections:
 * - **Projections** (read models returned by the API)
 * - **DTOs** (write models sent to the API)
 * - **Criteria** (query parameters for filtering and pagination)
 */

import type {
	ContentBlockKind,
	ContentBlockScopeFilter,
	ContentBlockSortAttribute
} from '$core/content-blocks/enums';
import type { CriteriaOperator, CriteriaSortOption } from '$core/_shared/enums';

// ── Shared nested types ─────────────────────────

/** Image associated with an entity via a media-relationship. */
export type EntityImage = {
	mediaId: string;
	order: number;
	originalUrl: string;
	variants: Record<string, string>;
};

// ── Projections (read models) ───────────────────

/** Full content block projection as returned by the API. */
export type ContentBlock = {
	id: string;
	activityId: string | null;
	description: string;
	images: EntityImage[];
	kind: ContentBlockKind;
	target: string;
	title: string;
};

// ── DTOs (write models) ─────────────────────────

/** Payload for creating a new content block. */
export type ContentBlockCreateDto = {
	id: string;
	activityId?: string;
	description: string;
	kind: ContentBlockKind;
	target: string;
	title: string;
	mediaIds?: string[];
};

/** Payload for partially updating an existing content block. */
export type ContentBlockUpdateDto = {
	description?: string;
	kind?: ContentBlockKind;
	mediaIds?: string[];
	target?: string;
	title?: string;
};

// ── Criteria (query params) ─────────────────────

/** Query parameters for filtering, sorting, and paginating content block lists. */
export type ContentBlockCriteria = {
	skip?: number;
	limit?: number;
	id?: string;
	kind?: ContentBlockKind;
	scope?: ContentBlockScopeFilter;
	searchText?: string;
	target?: string;
	title?: string;
	sort?: ContentBlockSortAttribute;
	operator?: CriteriaOperator;
	order?: CriteriaSortOption;
};
