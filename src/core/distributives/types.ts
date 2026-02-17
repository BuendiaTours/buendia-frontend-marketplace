/**
 * @module distributives/types
 * @description TypeScript type definitions for the Distributives resource.
 * Organised into Projections (read), DTOs (write), and Criteria (query).
 */

import type { DistributiveSortAttribute } from '$core/distributives/enums';
import type { CriteriaOperator, CriteriaSortOption } from '$core/_shared/enums';

// ── Projections (read models) ───────────────────

/** Category reference embedded within a distributive. */
export type DistributiveCategory = {
	id: string;
	name: string;
};

/** Destination reference embedded within a distributive. */
export type DistributiveDestination = {
	id: string;
	name: string;
};

/** Full distributive projection as returned by the API. */
export type Distributive = {
	id: string;
	category: DistributiveCategory;
	destination: DistributiveDestination;
	name: string;
	photoUrl: string;
	photoUrlHero: string | null;
	slug: string;
};

// ── DTOs (write models) ─────────────────────────

/** Payload for creating a new distributive. */
export type DistributiveCreateDto = {
	id: string;
	categoryId: string;
	destinationId: string;
	name: string;
	photoUrl: string;
	slug: string;
	photoUrlHero?: string;
};

/** Payload for partially updating an existing distributive. */
export type DistributiveUpdateDto = {
	name?: string;
	photoUrl?: string;
	photoUrlHero?: string | null;
	slug?: string;
};

// ── Criteria (query params) ─────────────────────

/** Query parameters for filtering, sorting, and paginating distributive lists. */
export type DistributiveCriteria = {
	page?: number;
	pageSize?: number;
	name?: string;
	search?: string;
	slug?: string;
	sort?: DistributiveSortAttribute;
	operator?: CriteriaOperator;
	order?: CriteriaSortOption;
};
