/**
 * @module free-tours/types
 * @description TypeScript type definitions for the Free Tours resource.
 * Organised into Projections (read), DTOs (write), and Criteria (query).
 */

import type {
	FreeTourExcluded,
	FreeTourIncluded,
	FreeTourRestriction,
	FreeTourSortAttribute,
	FreeTourStatus,
	StageKind,
	StageRelevance,
	StageRequirement
} from '$core/free-tours/enums';
import type { CriteriaOperator, CriteriaSortOption } from '$core/_shared/enums';
import type { Coords } from '$core/_shared/types';

// ── Projections (read models) ───────────────────

/** Content block reference embedded in a free tour. */
export type FreeTourContentBlock = {
	id: string;
	description: string;
	kind: string;
	target: string;
	title: string;
};

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

/** Meeting point location for a free tour. */
export type FreeTourMeetingPoint = {
	address: string;
	city: string;
	coords: Coords;
	countryCode: string;
	name: string;
	postCode: string;
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
	contentBlocks: FreeTourContentBlock[];
	descriptionFull: string;
	descriptionShort: string | null;
	destinationIds: string[];
	entries: FreeTourEntry[];
	excluded: FreeTourExcluded[];
	faqs: FreeTourFaq[];
	included: FreeTourIncluded[];
	meetingPoint: FreeTourMeetingPoint | null;
	phoneContact: string | null;
	restrictions: FreeTourRestriction[];
	images: FreeTourImage[];
	slug: string;
	stages: FreeTourStage[];
	status: FreeTourStatus;
	supplierTip: string | null;
	title: string;
	voucherInfo: string | null;
	willDoing: string[];
};

/**
 * Precondition names reported by the publish-readiness endpoint when a
 * free tour is not yet ready to be published.
 * - `destinations` — at least one destination id is required.
 * - `categories` — at least one category id is required.
 * - `media` — at least one media id is required.
 * - `entries` — at least one activity entry is required.
 * - `groupedActivity` — at least one entry must point to an activity
 *   currently in `GROUPED` status.
 */
export type FreeTourPublishPrecondition =
	| 'destinations'
	| 'categories'
	| 'media'
	| 'entries'
	| 'groupedActivity';

/** Response of the publish-readiness endpoint. `missing` lists every precondition not yet met. */
export type FreeTourPublishReadiness = {
	missing: FreeTourPublishPrecondition[];
	ready: boolean;
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

/**
 * Payload for creating a new free tour seeded with the common attributes of an existing
 * FREE_TOUR activity. The activity id is provided via the URL path; the body carries only
 * the new free tour id and the id for the entry that links the activity to the new free tour.
 */
export type FreeTourCreateFromActivityDto = {
	id: string;
	entryId: string;
};

/** Payload for partially updating an existing free tour. */
export type FreeTourUpdateDto = {
	categoryIds?: string[];
	contentBlockIds?: string[];
	descriptionFull?: string;
	descriptionShort?: string | null;
	destinationIds?: string[];
	excluded?: FreeTourExcluded[];
	included?: FreeTourIncluded[];
	mediaIds?: string[];
	meetingPoint?: FreeTourMeetingPoint;
	phoneContact?: string;
	restrictions?: FreeTourRestriction[];
	slug?: string;
	status?: FreeTourStatus;
	supplierTip?: string;
	title?: string;
	voucherInfo?: string;
	willDoing?: string[];
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
	/**
	 * Filter by the activity id of any of the free tour entries.
	 * Used after PATCHing an activity to PENDING_GROUP to locate the newly
	 * auto-created FreeTour aggregation.
	 */
	entryActivityId?: string;
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
