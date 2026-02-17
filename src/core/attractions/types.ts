/**
 * @module attractions/types
 * @description TypeScript type definitions for the Attractions resource.
 * Organised into Projections (read), DTOs (write), and Criteria (query).
 */

import type { AttractionSortAttribute, AttractionStatus } from '$core/attractions/enums';
import type { CriteriaOperator, CriteriaSortOption } from '$core/_shared/enums';
import type { Coords } from '$core/_shared/types';
import type { DestinationKind } from '$core/destinations/enums';

// ── Projections (read models) ───────────────────

/** Destination summary embedded within an attraction. */
export type AttractionDestination = {
	id: string;
	descriptionShort: string | null;
	name: string;
	kind: DestinationKind;
	photoUrlHero: string | null;
};

/** Full attraction projection as returned by the API. */
export type Attraction = {
	id: string;
	coordinates: Coords | null;
	createdAt: string;
	description: string | null;
	descriptionLong: string | null;
	destinations: AttractionDestination[];
	name: string;
	photoUrl: string | null;
	photoUrlHero: string | null;
	postalAddress: string | null;
	slug: string;
	status: AttractionStatus;
	updatedAt: string;
};

// ── DTOs (write models) ─────────────────────────

/** Payload for creating a new attraction. */
export type AttractionCreateDto = {
	id: string;
	name: string;
	slug: string;
	status: AttractionStatus;
	latitude?: number | null;
	longitude?: number | null;
	description?: string | null;
	descriptionLong?: string | null;
	destinationIds?: string[];
	photoUrl?: string | null;
	photoUrlHero?: string | null;
	postalAddress?: string | null;
};

/** Payload for partially updating an existing attraction. */
export type AttractionUpdateDto = {
	latitude?: number | null;
	longitude?: number | null;
	description?: string | null;
	descriptionLong?: string | null;
	destinationIds?: string[];
	name?: string;
	photoUrl?: string | null;
	photoUrlHero?: string | null;
	postalAddress?: string | null;
	slug?: string;
	status?: AttractionStatus;
};

// ── Criteria (query params) ─────────────────────

/** Query parameters for filtering, sorting, and paginating attraction lists. */
export type AttractionCriteria = {
	page?: number;
	pageSize?: number;
	name?: string;
	query?: string;
	search_text?: string;
	status?: AttractionStatus;
	radius?: number;
	latitude?: number;
	longitude?: number;
	slug?: string;
	sort?: AttractionSortAttribute;
	operator?: CriteriaOperator;
	order?: CriteriaSortOption;
};
