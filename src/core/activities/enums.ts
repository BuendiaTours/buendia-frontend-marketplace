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

/** Type of guide that leads the activity. */
export enum ActivityGuideKind {
	AUTO = 'AUTO',
	CUSTOM_LANGUAGE = 'CUSTOM_LANGUAGE',
	DRIVER = 'DRIVER',
	GUEST = 'GUEST',
	INSTRUCTOR = 'INSTRUCTOR'
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
	DIFFERENT_PLACE = 'DIFFERENT_PLACE'
}

/** Pet policy for the activity. */
export enum ActivityPetsAllowed {
	YES = 'YES',
	NO = 'NO',
	NOT_APPLY = 'NOT_APPLY'
}

/** Items included in the activity price. */
export enum ActivityIncluded {
	TICKETS_INCLUDED = 'TICKETS_INCLUDED',
	TICKETS_INCLUDED_BY_MODALITY = 'TICKETS_INCLUDED_BY_MODALITY',
	SKIP_THE_LINE = 'SKIP_THE_LINE',
	GUIDED_TOUR = 'GUIDED_TOUR',
	EXPERT_GUIDE = 'EXPERT_GUIDE',
	EXPERT_GUIDE_SPANISH = 'EXPERT_GUIDE_SPANISH',
	LOCAL_GUIDE_SPANISH = 'LOCAL_GUIDE_SPANISH',
	BUENDIA_TOUR_MANAGER = 'BUENDIA_TOUR_MANAGER',
	AUDIO_GUIDE_SPANISH = 'AUDIO_GUIDE_SPANISH',
	AUDIO_GUIDE_ENGLISH = 'AUDIO_GUIDE_ENGLISH',
	AUDIO_GUIDE_CHINESE = 'AUDIO_GUIDE_CHINESE',
	WIRELESS_RADIO_GUIDE = 'WIRELESS_RADIO_GUIDE',
	HEADPHONES = 'HEADPHONES',
	PRIVATE_BUS = 'PRIVATE_BUS',
	PRIVATE_BOAT = 'PRIVATE_BOAT',
	PRIVATE_TRAIN = 'PRIVATE_TRAIN',
	PRIVATE_VEHICLE = 'PRIVATE_VEHICLE',
	PUBLIC_TRANSPORT_TRAIN = 'PUBLIC_TRANSPORT_TRAIN',
	PUBLIC_TRANSPORT_BUS = 'PUBLIC_TRANSPORT_BUS',
	PUBLIC_TRANSPORT_FERRY = 'PUBLIC_TRANSPORT_FERRY',
	HOTEL_PICKUP = 'HOTEL_PICKUP'
}

/** Items not included in the activity price. */
export enum ActivityExcluded {
	TRANSPORT_TO_MEETING_POINT = 'TRANSPORT_TO_MEETING_POINT',
	TICKETS = 'TICKETS',
	TRANSPORT_TICKET = 'TRANSPORT_TICKET',
	GUIDED_TOUR = 'GUIDED_TOUR',
	INTERIOR_VISITS = 'INTERIOR_VISITS',
	FOOD_AND_DRINKS = 'FOOD_AND_DRINKS',
	TIPS = 'TIPS',
	HEADPHONES = 'HEADPHONES',
	SPORTS_EQUIPMENT = 'SPORTS_EQUIPMENT',
	OTHER = 'OTHER'
}

/** Type of multimedia asset attached to an activity. */
export enum MultimediaKind {
	IMAGE = 'IMAGE',
	VIDEO = 'VIDEO'
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
