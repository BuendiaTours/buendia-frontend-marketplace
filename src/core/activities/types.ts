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
	ActivityGuideKind,
	ActivityKind,
	ActivityNotSuitableFor,
	ActivityPetsAllowed,
	ActivityRestriction,
	ActivitySortAttribute,
	ActivityStatus,
	ActivityTransportKind,
	ActivityTransportLocation,
	MealAdditional,
	MealFormat,
	MealKind,
	MultimediaKind,
	StageKind,
	StageRelevance,
	StageRequirement
} from '$core/activities/enums';
import type { CriteriaOperator, CriteriaSortOption } from '$core/_shared/enums';
import type { Coords } from '$core/_shared/types';

// ── Projections (read models) ───────────────────

/** Lightweight attraction reference embedded in an activity. */
export type ActivityAttraction = {
	id: string;
	name: string;
};

/** Lightweight category reference embedded in an activity. */
export type ActivityCategory = {
	id: string;
	name: string;
};

/** Lightweight destination reference embedded in an activity. */
export type ActivityDestination = {
	id: string;
	name: string;
};

/** Lightweight distributive reference embedded in an activity. */
export type ActivityDistributive = {
	id: string;
	name: string;
};

/** Multimedia asset (image or video) attached to an activity. */
export type ActivityMultimedia = {
	id: string;
	fileName: string;
	kind: MultimediaKind;
	url: string;
};

/** Pet policy details for an activity. */
export type ActivityPetsAllowedInfo = {
	allowed: ActivityPetsAllowed;
	description: string | null;
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
	categories: ActivityCategory[];
	codeRef: string | null;
	descriptionFull: string;
	descriptionShort: string;
	destinations: ActivityDestination[];
	distributives: ActivityDistributive[];
	excluded: string[];
	guideKind: ActivityGuideKind;
	included: string[];
	infoImportant: string | null;
	itemsToBring: string[];
	kind: ActivityKind;
	meals: ActivityMeal[];
	multimedias: ActivityMultimedia[];
	notSuitableFor: ActivityNotSuitableFor[];
	petsAllowed: ActivityPetsAllowedInfo;
	phoneContact: string | null;
	restrictions: ActivityRestriction[];
	slug: string;
	stages: ActivityStage[];
	status: ActivityStatus;
	supplierId: string;
	title: string;
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
	descriptionShort: string;
	descriptionFull: string;
	guideKind: ActivityGuideKind;
	kind: ActivityKind;
	slug: string;
	title: string;
	codeRef?: string;
	infoImportant?: string;
	phoneContact?: string;
};

/** Payload for partially updating an existing activity. */
export type ActivityUpdateDto = {
	codeRef?: string;
	descriptionFull?: string;
	descriptionShort?: string;
	excluded?: string[];
	guideKind?: ActivityGuideKind;
	included?: string[];
	infoImportant?: string;
	itemsToBring?: string[];
	kind?: ActivityKind;
	notSuitableFor?: string[];
	petsAllowed?: ActivityPetsAllowed;
	petsAllowedDescription?: string | null;
	phoneContact?: string | null;
	restrictions?: ActivityRestriction[];
	slug?: string;
	status?: ActivityStatus;
	title?: string;
	transportKind?: ActivityTransportKind;
	transportLocation?: ActivityTransportLocation;
	voucherInfo?: string | null;
	willDoing?: string[];
};

/** Payload for adding a meal to an activity. */
export type ActivityMealAddDto = {
	id: string;
	kind: MealKind;
	format: MealFormat;
	allergens: ActivityAllergen[];
	additionalOptions: MealAdditional[];
};

/** Payload for adding a multimedia asset to an activity. */
export type ActivityMultimediaAddDto = {
	id: string;
	kind: MultimediaKind;
	fileName: string;
	url: string;
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

// ── Criteria (query params) ─────────────────────

/** Query parameters for filtering, sorting, and paginating activity lists. */
export type ActivityCriteria = {
	page?: number;
	pageSize?: number;
	id?: string;
	codeRef?: string;
	kind?: ActivityKind;
	status?: ActivityStatus;
	supplierId?: string;
	title?: string;
	slug?: string;
	sort?: ActivitySortAttribute;
	operator?: CriteriaOperator;
	order?: CriteriaSortOption;
};
