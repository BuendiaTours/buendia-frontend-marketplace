/**
 * @module attractions/types
 * @description TypeScript type definitions for the Attractions resource.
 * Organised into Projections (read), DTOs (write), and Criteria (query).
 */

import type {
	AttractionLocationKind,
	AttractionSortAttribute,
	AttractionStatus
} from '$core/attractions/enums';
import type { CriteriaOperator, CriteriaSortOption } from '$core/_shared/enums';
import type { Coords } from '$core/_shared/types';

// ── Projections (read models) ───────────────────

/** Location summary embedded within an attraction. */
export type AttractionLocation = {
	id: string;
	coordinates: Coords | null;
	descriptionShort: string | null;
	kind: AttractionLocationKind;
	name: string;
};

/** Image asset attached to an attraction via media-relationship. */
export type AttractionImage = {
	mediaId: string;
	order: number;
	variants: Record<string, string>;
};

/** Full attraction projection as returned by the API. */
export type Attraction = {
	id: string;
	coordinates: Coords | null;
	createdAt: string;
	description: string | null;
	descriptionLong: string | null;
	images: AttractionImage[];
	locations: AttractionLocation[];
	name: string;
	postalAddress: string | null;
	status: AttractionStatus;
	updatedAt: string;
};

// ── DTOs (write models) ─────────────────────────

/** Payload for creating a new attraction. */
export type AttractionCreateDto = {
	id: string;
	name: string;
	status: AttractionStatus;
	description?: string;
	descriptionLong?: string;
	latitude?: number;
	locationIds?: string[];
	longitude?: number;
	postalAddress?: string;
};

/** Payload for partially updating an existing attraction. */
export type AttractionUpdateDto = {
	description?: string;
	descriptionLong?: string;
	latitude?: number;
	locationIds?: string[];
	longitude?: number;
	name?: string;
	postalAddress?: string;
	status?: AttractionStatus;
};

// ── Criteria (query params) ─────────────────────

/** Query parameters for filtering, sorting, and paginating attraction lists. */
export type AttractionCriteria = {
	skip?: number;
	limit?: number;
	latitude?: number;
	longitude?: number;
	name?: string;
	query?: string;
	radius?: number;
	search_text?: string;
	status?: AttractionStatus;
	sort?: AttractionSortAttribute;
	operator?: CriteriaOperator;
	order?: CriteriaSortOption;
};
