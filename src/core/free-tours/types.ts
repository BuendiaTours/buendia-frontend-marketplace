/**
 * @module free-tours/types
 * @description TypeScript type definitions for the Free Tours resource.
 * Organised into Projections (read), DTOs (write), and Criteria (query).
 */

import type {
	FreeTourSortAttribute,
	FreeTourStatus,
	StageKind,
	StageRelevance,
	StageRequirement
} from '$core/free-tours/enums';
import type { CriteriaOperator, CriteriaSortOption } from '$core/_shared/enums';
import type { Coords } from '$core/_shared/types';

// ── Projections (read models) ───────────────────

/** Activity entry linked to a free tour with priority ordering. */
export type FreeTourEntry = {
	id: string;
	activityId: string;
	priority: number;
};

/** Image entry embedded within a free tour. */
export type FreeTourImage = {
	altText: string;
	mediaId: string;
	order: number;
	originalUrl: string;
	title: string;
	variants: Record<string, string>;
};

/** FAQ entry embedded within a free tour. */
export type FreeTourFaq = {
	answer: string;
	id: string;
	position: number;
	question: string;
	status: string;
};

/** Itinerary stage within a free tour. */
export type FreeTourStage = {
	id: string;
	coords: Coords | null;
	description: string | null;
	duration: number;
	kind: StageKind;
	name: string | null;
	order: number;
	relevance: StageRelevance;
	requirement: StageRequirement;
};

/** Full free tour projection as returned by the API. */
export type FreeTour = {
	id: string;
	categoryIds: string[];
	descriptionFull: string;
	descriptionShort: string | null;
	destinationIds: string[];
	entries: FreeTourEntry[];
	faqs: FreeTourFaq[];
	images: FreeTourImage[];
	slug: string;
	stages: FreeTourStage[];
	status: FreeTourStatus;
	title: string;
};

// ── DTOs (write models) ─────────────────────────

/** Payload for creating a new free tour. */
export type FreeTourCreateDto = {
	id: string;
	categoryIds?: string[];
	descriptionFull: string;
	descriptionShort?: string;
	destinationIds?: string[];
	slug: string;
	title: string;
};

/** Payload for partially updating an existing free tour. */
export type FreeTourUpdateDto = {
	categoryIds?: string[];
	descriptionFull?: string;
	descriptionShort?: string | null;
	destinationIds?: string[];
	slug?: string;
	status?: FreeTourStatus;
	title?: string;
};

/** Payload for adding an activity entry to a free tour. */
export type FreeTourEntryAddDto = {
	id: string;
	activityId: string;
	priority: number;
};

/** Payload for adding an itinerary stage to a free tour. */
export type FreeTourStageAddDto = {
	id: string;
	coords?: Coords;
	description?: string;
	duration: number;
	kind: StageKind;
	name?: string;
	order: number;
	relevance: StageRelevance;
	requirement: StageRequirement;
};

// ── Criteria (query params) ─────────────────────

/** Query parameters for filtering, sorting, and paginating free tour lists. */
export type FreeTourCriteria = {
	id?: string;
	limit?: number;
	operator?: CriteriaOperator;
	order?: CriteriaSortOption;
	searchText?: string;
	skip?: number;
	slug?: string;
	sort?: FreeTourSortAttribute;
	status?: FreeTourStatus;
	title?: string;
};
