/**
 * @module activities/enums
 * @description Domain enums for the Activities resource.
 * These mirror the backend contract exactly and carry no UI or i18n dependencies.
 */

/** Publication lifecycle status of an activity. */
export enum ActivityStatus {
	APPROVED = 'APPROVED',
	DELETED = 'DELETED',
	DRAFT = 'DRAFT',
	PENDING_REVIEW = 'PENDING_REVIEW',
	PUBLISHED = 'PUBLISHED',
	REJECTED = 'REJECTED',
	UNPUBLISHED = 'UNPUBLISHED'
}

/** Commercial classification of an activity. */
export enum ActivityKind {
	PAID_TOUR = 'PAID_TOUR',
	FREE_TOUR = 'FREE_TOUR',
	OTHER = 'OTHER'
}

/** How date/time information is displayed for an activity. */
export enum ActivityDateMode {
	DATE_AND_TIME = 'DATE_AND_TIME',
	DATE = 'DATE'
}

/** Type of guide that leads the activity. */
export enum ActivityGuideKind {
	AUTO = 'AUTO',
	CUSTOM_LANGUAGE = 'CUSTOM_LANGUAGE',
	DRIVER = 'DRIVER',
	GUEST = 'GUEST',
	INSTRUCTOR = 'INSTRUCTOR'
}

/** Role of a location within an activity itinerary. */
export enum ActivityLocationRole {
	DESTINATION = 'DESTINATION',
	WAYPOINT = 'WAYPOINT'
}

/** Audience segments the activity is not suitable for. */
export enum ActivityNotSuitableFor {
	ADULTS = 'ADULTS',
	CHILDREN = 'CHILDREN',
	FAMILIES = 'FAMILIES',
	GROUPS = 'GROUPS',
	INDIVIDUALS = 'INDIVIDUALS'
}

/** Known restrictions that apply during the activity. */
export enum ActivityRestriction {
	ALCOHOL = 'ALCOHOL',
	SMOKING = 'SMOKING',
	PETS = 'PETS',
	OTHER = 'OTHER'
}

/** EU-regulated food allergens that may be present during the activity. */
export enum ActivityAllergen {
	CELERY = 'CELERY',
	CRUSTACEANS = 'CRUSTACEANS',
	EGGS = 'EGGS',
	FISH = 'FISH',
	GLUTEN = 'GLUTEN',
	LUPIN = 'LUPIN',
	MILK = 'MILK',
	MOLLUSCS = 'MOLLUSCS',
	MUSTARD = 'MUSTARD',
	NUTS = 'NUTS',
	PEANUTS = 'PEANUTS',
	SESAME = 'SESAME',
	SOY = 'SOY',
	SULPHITES = 'SULPHITES'
}

/** Mode of transport used during the activity. */
export enum ActivityTransportKind {
	BUS = 'BUS',
	CAR = 'CAR',
	TRAIN = 'TRAIN',
	PLANE = 'PLANE',
	BOAT = 'BOAT',
	BIKE = 'BIKE',
	OTHER = 'OTHER',
	NONE = 'NONE'
}

/** Whether the activity starts and ends at the same location. */
export enum ActivityTransportLocation {
	SAME_PLACE = 'SAME_PLACE',
	DIFFERENT_PLACE = 'DIFFERENT_PLACE',
	NOT_APPLY = 'NOT_APPLY'
}

/** Pet policy for the activity. */
export enum ActivityPetsAllowed {
	YES = 'YES',
	NO = 'NO',
	NOT_APPLY = 'NOT_APPLY'
}

// ── Stages ──────────────────────────────────────

/** Nature of a stage within an activity itinerary. */
export enum StageKind {
	TRANSFER = 'TRANSFER',
	EXPERIENCE = 'EXPERIENCE'
}

/** Importance level of a stage. */
export enum StageRelevance {
	HIGH = 'HIGH',
	MEDIUM = 'MEDIUM',
	LOW = 'LOW',
	NONE = 'NONE'
}

/** Participation requirement for a stage. */
export enum StageRequirement {
	OPTIONAL = 'OPTIONAL',
	REQUIRED = 'REQUIRED',
	SUGGESTED = 'SUGGESTED',
	NONE = 'NONE'
}

// ── Sort ────────────────────────────────────────

/** Attributes available for sorting activity lists. */
export enum ActivitySortAttribute {
	CODE_REF = 'CODE_REF',
	TITLE = 'title'
}

// ── Meals ───────────────────────────────────────

/** Presentation format of a meal. */
export enum MealFormat {
	BARBECUE = 'BARBECUE',
	BUFFET = 'BUFFET',
	COMPLETE = 'COMPLETE',
	COURSE = 'COURSE',
	PICNIC = 'PICNIC',
	SNACK = 'SNACK',
	TAKE_AWAY = 'TAKE_AWAY',
	TASTING = 'TASTING'
}

/** Time-of-day classification for a meal. */
export enum MealKind {
	BREAKFAST = 'BREAKFAST',
	BRUNCH = 'BRUNCH',
	DEPEND_ON_HOUR = 'PENDING_HOUR',
	DINNER = 'DINNER',
	LUNCH = 'LUNCH',
	OTHER = 'OTHER'
}

/** Dietary and sourcing labels applicable to a meal. */
export enum MealAdditional {
	VEGETARIAN = 'VEGETARIAN',
	VEGAN = 'VEGAN',
	GLUTEN_FREE = 'GLUTEN_FREE',
	LACTOSE_FREE = 'LACTOSE_FREE',
	NUT_FREE = 'NUT_FREE',
	SOY_FREE = 'SOY_FREE',
	MUSHROOM_FREE = 'MUSHROOM_FREE',
	SEAFOOD_FREE = 'SEAFOOD_FREE',
	SHELLFISH_FREE = 'SHELLFISH_FREE',
	EGG_FREE = 'EGG_FREE',
	PALEO = 'PALEO',
	KETO = 'KETO',
	MEDITERRANEAN = 'MEDITERRANEAN',
	FRESH = 'FRESH',
	LOCAL = 'LOCAL',
	ORGANIC = 'ORGANIC',
	BIO = 'BIO'
}

// ── Indexation ───────────────────────────────────────

export enum ActivityIndexationPriority {
	HIGH = 'HIGH',
	MEDIUM = 'MEDIUM',
	LOW = 'LOW',
	NONE = 'NONE'
}

export enum CoreActivityStatus {
	ACTIVE = 'ACTIVE',
	FAILED = 'FAILED',
	INACTIVE = 'INACTIVE',
	PENDING = 'PENDING',
	PENDING_TO_MATCH = 'PENDING_TO_MATCH',
	RUNNING = 'RUNNING'
}
