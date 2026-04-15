/**
 * @module distributives/types
 * @description TypeScript type definitions for the Distributives resource.
 * Organised into Projections (read), DTOs (write), and Criteria (query).
 */

import type {
	DistributiveLocationRole,
	DistributiveSortAttribute,
	DistributiveStatus
} from '$core/distributives/enums';
import type { CriteriaOperator, CriteriaSortOption } from '$core/_shared/enums';

// ── Projections (read models) ───────────────────

/** Attraction reference embedded within a distributive. */
export type DistributiveAttraction = {
	id: string;
	description: string | null;
	descriptionLong: string | null;
	locationIds: string[];
	name: string;
};

/** Breadcrumb navigation item linking to a parent distributive. */
export type DistributiveBreadcrumb = {
	id: string;
	distributiveId: string;
	href: string;
	name: string;
};

/** Category reference embedded within a distributive. */
export type DistributiveCategory = {
	id: string;
	name: string;
};

/** Location entry within a distributive grouped by category. */
export type DistributiveByCategoryLocation = {
	id: string;
	locationId: string;
	name: string;
	role: DistributiveLocationRole;
};

/** Distributive entry within a category group. */
export type DistributiveByCategoryEntry = {
	id: string;
	locations: DistributiveByCategoryLocation[];
	name: string;
	slug: string;
};

/** FAQ entry embedded within a distributive. */
export type DistributiveFaq = {
	answer: string;
	id: string;
	position: number;
	question: string;
	status: string;
};

/** Category group containing related distributives. */
export type DistributiveGroupedByCategory = {
	categoryId: string;
	categoryName: string;
	distributives: DistributiveByCategoryEntry[];
};

/** Image entry embedded within a distributive. */
export type DistributiveImage = {
	altText: string;
	mediaId: string;
	order: number;
	originalUrl: string;
	title: string;
	variants: Record<string, string>;
};

/** Location reference embedded within a distributive. */
export type DistributiveLocation = {
	id: string;
	locationId: string;
	name: string;
	role: DistributiveLocationRole;
};

/** Related attraction projected for a distributive location match. */
export type DistributiveRelatedAttraction = {
	id: string;
	description: string | null;
	descriptionLong: string | null;
	distributiveId: string;
	distributiveSlug: string;
	images: DistributiveImage[];
	locationIds: string[];
	name: string;
};

/** Tag reference embedded within a distributive. */
export type DistributiveTag = {
	id: string;
	tagId: string;
};

/** Full distributive projection as returned by the API. */
export type Distributive = {
	id: string;
	attractions: DistributiveAttraction[];
	breadcrumbs: DistributiveBreadcrumb[];
	categories: DistributiveCategory[];
	faqs: DistributiveFaq[];
	images: DistributiveImage[];
	locations: DistributiveLocation[];
	minPrice: number;
	name: string;
	relatedDistributivesByAttractionLocation: DistributiveRelatedAttraction[];
	relatedDistributivesByCategory: DistributiveGroupedByCategory[];
	slug: string;
	status: DistributiveStatus;
	tags: DistributiveTag[];
	totalActivities: number;
};

// ── DTOs (write models) ─────────────────────────

/** Payload for adding an attraction to a distributive. */
export type DistributiveAttractionAddDto = {
	attractionId: string;
};

/** Payload for adding a category to a distributive. */
export type DistributiveCategoryAddDto = {
	categoryId: string;
};

/** Payload for creating a new distributive. */
export type DistributiveCreateDto = {
	id: string;
	featuredScore?: number;
	mediaIds?: string[];
	name: string;
	slug: string;
};

/** Payload for adding a location to a distributive. */
export type DistributiveLocationAddDto = {
	id: string;
	locationId: string;
	role: DistributiveLocationRole;
};

/** Payload for partially updating an existing distributive. */
export type DistributiveUpdateDto = {
	attractionId?: string;
	featuredScore?: number;
	mediaIds?: string[];
	name?: string;
	slug?: string;
	status?: DistributiveStatus;
};

// ── Criteria (query params) ─────────────────────

/** Location filter pair for criteria queries. */
export type DistributiveLocationFilter = {
	locationId: string;
	role: DistributiveLocationRole;
};

/** Query parameters for filtering, sorting, and paginating distributive lists. */
export type DistributiveCriteria = {
	attractionId?: string;
	attractionIds?: string[];
	categoryId?: string;
	categoryIds?: string[];
	limit?: number;
	locationId?: string;
	locationIds?: string[];
	locations?: DistributiveLocationFilter[];
	name?: string;
	operator?: CriteriaOperator;
	order?: CriteriaSortOption;
	searchText?: string;
	skip?: number;
	slug?: string;
	sort?: DistributiveSortAttribute;
	tagId?: string;
	tagIds?: string[];
};
