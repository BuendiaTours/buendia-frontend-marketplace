/**
 * @module locations/types
 * @description TypeScript type definitions for the Locations resource.
 * Organised into Projections (read), DTOs (write), and Criteria (query).
 */

import type { LocationKind, LocationSortAttribute } from '$core/locations/enums';
import type { CriteriaOperator, CriteriaSortOption } from '$core/_shared/enums';

// ── Projections (read models) ───────────────────

/** Image asset attached to a location via media-relationship. */
export type LocationImage = {
	mediaId: string;
	order: number;
	variants: Record<string, string>;
};

/** Parent location summary embedded within a child location. */
export type LocationParent = {
	id: string;
	descriptionLong: string | null;
	descriptionShort: string | null;
	images: LocationImage[];
	kind: LocationKind;
	latitude: number | null;
	longitude: number | null;
	name: string;
};

/** Full location projection as returned by the API. */
export type Location = {
	id: string;
	slug?: string;
	createdAt?: string;
	descriptionLong: string | null;
	descriptionShort: string | null;
	images?: LocationImage[];
	kind: LocationKind;
	latitude?: number | null;
	longitude?: number | null;
	name: string;
	parent?: LocationParent | null;
	photoUrlHero?: string;
};

// ── DTOs (write models) ─────────────────────────

/** Payload for creating a new location. */
export type LocationCreateDto = {
	id: string;
	kind: LocationKind;
	name: string;
	descriptionLong?: string;
	descriptionShort?: string;
	latitude?: number;
	longitude?: number;
	parentId?: string;
};

/** Payload for partially updating an existing location. */
export type LocationUpdateDto = {
	descriptionLong?: string;
	descriptionShort?: string;
	kind?: LocationKind;
	latitude?: number;
	longitude?: number;
	name?: string;
	parentId?: string;
};

// ── Criteria (query params) ─────────────────────

/** Query parameters for filtering, sorting, and paginating location lists. */
export type LocationCriteria = {
	skip?: number;
	limit?: number;
	kind?: LocationKind;
	latitude?: number;
	longitude?: number;
	name?: string;
	parentId?: string;
	query?: string;
	search_text?: string;
	radius?: number;
	sort?: LocationSortAttribute;
	operator?: CriteriaOperator;
	order?: CriteriaSortOption;
};
