/**
 * @module destinations/types
 * @description TypeScript type definitions for the Destinations resource.
 * Organised into Projections (read), DTOs (write), and Criteria (query).
 */

import type { DestinationKind, DestinationSortAttribute } from '$core/destinations/enums';
import type { CriteriaOperator, CriteriaSortOption } from '$core/_shared/enums';
import type { BackofficePhoto } from '$lib/types';

// ── Projections (read models) ───────────────────

/** Parent destination summary embedded within a child destination. */
export type DestinationParent = {
	id: string;
	descriptionLong: string | null;
	descriptionShort: string | null;
	kind: DestinationKind;
	latitude: number | null;
	longitude: number | null;
	name: string;
	photoUrl: string | null;
	photoUrlHero: string | null;
	slug: string;
};

/** Full destination projection as returned by the API. */
export type Destination = {
	id: string;
	createdAt: string;
	descriptionLong: string | null;
	descriptionShort: string | null;
	kind: DestinationKind;
	latitude: number | null;
	longitude: number | null;
	name: string;
	parent: DestinationParent | null;
	image?: Partial<BackofficePhoto>;
	photoUrl?: string | null;
	photoUrlHero?: string | null;
	slug: string;
};

// ── DTOs (write models) ─────────────────────────

/** Payload for creating a new destination. */
export type DestinationCreateDto = {
	id: string;
	kind: DestinationKind;
	name: string;
	slug: string;
	parentId?: string | null;
	descriptionLong?: string | null;
	descriptionShort?: string | null;
	latitude?: number | null;
	longitude?: number | null;
	photoId?: string | null;
};

/** Payload for partially updating an existing destination. */
export type DestinationUpdateDto = {
	parentId?: string | null;
	descriptionLong?: string | null;
	descriptionShort?: string | null;
	kind?: DestinationKind;
	name?: string;
	latitude?: number | null;
	longitude?: number | null;
	photoId?: string | null;
	slug?: string;
};

// ── Criteria (query params) ─────────────────────

/** Query parameters for filtering, sorting, and paginating destination lists. */
export type DestinationCriteria = {
	page?: number;
	pageSize?: number;
	name?: string;
	query?: string;
	parentId?: string;
	kind?: DestinationKind;
	radius?: number;
	latitude?: number;
	longitude?: number;
	slug?: string;
	sort?: DestinationSortAttribute;
	operator?: CriteriaOperator;
	order?: CriteriaSortOption;
};
