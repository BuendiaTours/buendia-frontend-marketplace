/**
 * @module activities/types
 * @description TypeScript type definitions for the Activities resource.
 * Organized into three sections:
 * - **Projections** (read models returned by the API)
 * - **DTOs** (write models sent to the API)
 * - **Criteria** (query parameters for filtering and pagination)
 */

import type {
	ActivityAllergen,
	ActivityDateMode,
	ActivityExcluded,
	ActivityGuideKind,
	ActivityIncluded,
	ActivityIndexationPriority,
	ActivityKind,
	ActivityLocationRole,
	ActivityNotSuitableFor,
	ActivityPetsAllowed,
	ActivityRestriction,
	ActivitySortAttribute,
	ActivityStatus,
	ActivityTransportKind,
	ActivityTransportLocation,
	CoreActivityStatus,
	MealAdditional,
	MealFormat,
	MealKind,
	StageKind,
	StageRelevance,
	StageRequirement
} from '$core/activities/enums';
import type { CriteriaOperator, CriteriaSortOption } from '$core/_shared/enums';
import type { Coords } from '$core/_shared/types';
import type { BookingSystem } from '$core/bookings/enums';

// ── Projections (read models) ───────────────────

/** Lightweight attraction reference embedded in an activity. */
export type ActivityAttraction = {
	id: string;
	name: string;
};

/** Content block reference embedded in an activity. */
export type ActivityContentBlock = {
	id: string;
	description: string;
	kind: string;
	target: string;
	title: string;
};

/** Lightweight category reference embedded in an activity. */
export type ActivityCategory = {
	id: string;
	name: string;
};

/** Location reference with role embedded in an activity. */
export type ActivityLocation = {
	id: string;
	locationId: string;
	name: string;
	role: ActivityLocationRole;
};

/** Lightweight distributive reference embedded in an activity. */
export type ActivityDistributive = {
	id: string;
	name: string;
};

/** Supplier reference embedded in an activity. */
export type ActivitySupplier = {
	id: string;
	name: string;
};

/** Image asset attached to an activity. */
export type ActivityImage = {
	mediaId: string;
	altText: string;
	order: number;
	originalUrl: string;
	title: string;
	variants: Record<string, string>;
};

/** Pet policy details for an activity. */
export type ActivityPetsAllowedInfo = {
	allowed: ActivityPetsAllowed;
	description: string | null;
};

/** Meeting point location for an activity. */
export type ActivityMeetingPoint = {
	address: string;
	city: string;
	coords: Coords;
	countryCode: string;
	name: string;
	postCode: string;
};

/** FAQ entry embedded in an activity. */
export type ActivityFaq = {
	id: string;
	answer: string;
	position: number;
	question: string;
	status: string;
};

/** Tag reference embedded in an activity. */
export type ActivityTag = {
	id: string;
	tagId: string;
};

/** Meal included in an activity, with dietary and allergen metadata. */
export type ActivityMeal = {
	id: string;
	additionalOptions: MealAdditional[];
	allergens: ActivityAllergen[];
	format: MealFormat;
	kind: MealKind;
};

/** A single stage (stop or transfer) in an activity itinerary. */
export type ActivityStage = {
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

/** Full activity projection as returned by the API. */
export type Activity = {
	id: string;
	attractions: ActivityAttraction[];
	averageRating: number | null;
	categories: ActivityCategory[];
	codeRef: string | null;
	contentBlocks: ActivityContentBlock[];
	dateMode: ActivityDateMode;
	descriptionFull: string;
	descriptionShort: string | null;
	difficult: number;
	distributives: ActivityDistributive[];
	excluded: ActivityExcluded[];
	faqs: ActivityFaq[];
	guideKind: ActivityGuideKind;
	images: ActivityImage[];
	included: ActivityIncluded[];
	infoImportant: string | null;
	itemsToBring: string[];
	kind: ActivityKind;
	locations: ActivityLocation[];
	meals: ActivityMeal[];
	meetingPoint: ActivityMeetingPoint | null;
	notSuitableFor: ActivityNotSuitableFor[];
	petsAllowed: ActivityPetsAllowedInfo;
	phoneContact: string | null;
	restrictions: ActivityRestriction[];
	slug: string;
	stages: ActivityStage[];
	status: ActivityStatus;
	supplier: ActivitySupplier;
	supplierTip: string | null;
	tags: ActivityTag[];
	title: string;
	totalReviews: number;
	transportKind: ActivityTransportKind;
	transportLocation: ActivityTransportLocation;
	voucherInfo: string | null;
	willDoing: string[];
};

// ── DTOs (write models) ─────────────────────────

/** Payload for creating a new activity. */
export type ActivityCreateDto = {
	id: string;
	supplierId: string;
	codeRef?: string;
	dateMode?: ActivityDateMode;
	descriptionFull: string;
	descriptionShort?: string;
	featuredScore?: number;
	guideKind: ActivityGuideKind;
	infoImportant?: string;
	kind: ActivityKind;
	phoneContact?: string;
	slug: string;
	title: string;
};

/** Payload for partially updating an existing activity. */
export type ActivityUpdateDto = {
	codeRef?: string;
	dateMode?: ActivityDateMode;
	descriptionFull?: string;
	descriptionShort?: string;
	difficult?: number;
	excluded?: ActivityExcluded[];
	featuredScore?: number;
	guideKind?: ActivityGuideKind;
	included?: ActivityIncluded[];
	infoImportant?: string;
	itemsToBring?: string[];
	kind?: ActivityKind;
	mediaIds?: string[];
	meetingPoint?: ActivityMeetingPoint;
	notSuitableFor?: string[];
	petsAllowed?: ActivityPetsAllowed;
	petsAllowedDescription?: string;
	phoneContact?: string;
	restrictions?: ActivityRestriction[];
	slug?: string;
	supplierTip?: string;
	title?: string;
	transportKind?: ActivityTransportKind;
	transportLocation?: ActivityTransportLocation;
	voucherInfo?: string;
	willDoing?: string[];
};

/** Payload for adding an attraction to an activity. */
export type ActivityAttractionAddDto = {
	attractionId: string;
};

/** Payload for adding a content block to an activity. */
export type ActivityContentBlockAddDto = {
	contentBlockId: string;
};

/** Payload for adding a category to an activity. */
export type ActivityCategoryAddDto = {
	categoryId: string;
};

/** Payload for adding a distributive to an activity. */
export type ActivityDistributiveAddDto = {
	distributiveId: string;
};

/** Payload for adding a location to an activity. */
export type ActivityLocationAddDto = {
	id: string;
	locationId: string;
	role: ActivityLocationRole;
};

/** Payload for adding a meal to an activity. */
export type ActivityMealAddDto = {
	id: string;
	additionalOptions: MealAdditional[];
	allergens: ActivityAllergen[];
	format: MealFormat;
	kind: MealKind;
};

/** Payload for adding a stage to an activity itinerary. */
export type ActivityStageAddDto = {
	id: string;
	duration: number;
	kind: StageKind;
	order: number;
	relevance: StageRelevance;
	requirement: StageRequirement;
	coords?: Coords;
	description?: string;
	name?: string;
};

/** Payload for reordering the stages of an activity. */
export type ActivityStageReorderDto = {
	stageIds: string[];
};

// ── Criteria (query params) ─────────────────────

/** Query parameters for filtering, sorting, and paginating activity lists. */
export type ActivityCriteria = {
	skip?: number;
	limit?: number;
	attractionIds?: string[];
	categoryIds?: string[];
	codeRef?: string;
	id?: string;
	kind?: ActivityKind;
	locationIds?: string[];
	operator?: CriteriaOperator;
	order?: CriteriaSortOption;
	search_text?: string;
	slug?: string;
	sort?: ActivitySortAttribute;
	status?: ActivityStatus;
	statuses?: ActivityStatus[];
	supplierId?: string;
	tagIds?: string[];
	title?: string;
};

// -- Activity Indexation

export type ActivityIndexationDto = {
	bookingSystemId: string;
	coreId: string;
	bookingSystem: BookingSystem;
	coreTitle: string;
	priority: ActivityIndexationPriority;
	tenant?: string;
};

export type ActivityIndexation = {
	coreId: string;
	bookingSystem: BookingSystem;
	bookingSystemId: string;
	coreTitle: string;
	priority: ActivityIndexationPriority;
	status: CoreActivityStatus;
	tenant: string | null;
};
