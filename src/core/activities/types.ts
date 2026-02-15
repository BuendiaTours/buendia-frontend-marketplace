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

// --- Projections (read models) ---

export type ActivityAttraction = {
	id: string;
	name: string;
};

export type ActivityCategory = {
	id: string;
	name: string;
};

export type ActivityDestination = {
	id: string;
	name: string;
};

export type ActivityDistributive = {
	id: string;
	name: string;
};

export type ActivityMultimedia = {
	id: string;
	fileName: string;
	kind: MultimediaKind;
	url: string;
};

export type ActivityPetsAllowedInfo = {
	allowed: ActivityPetsAllowed;
	description: string | null;
};

export type ActivityMeal = {
	id: string;
	additionalOptions: MealAdditional[];
	allergens: ActivityAllergen[];
	format: MealFormat;
	kind: MealKind;
};

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

// --- DTOs (write models) ---

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

export type ActivityMealAddDto = {
	id: string;
	kind: MealKind;
	format: MealFormat;
	allergens: ActivityAllergen[];
	additionalOptions: MealAdditional[];
};

export type ActivityMultimediaAddDto = {
	id: string;
	kind: MultimediaKind;
	fileName: string;
	url: string;
};

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

// --- Criteria (query params) ---

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
