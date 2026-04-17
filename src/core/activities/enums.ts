/**
 * @module activities/enums
 * @description Domain enums for the Activities resource.
 * These mirror the backend contract exactly and carry no UI or i18n dependencies.
 */

/** Publication lifecycle status of an activity.
 *
 * State machine for FREE_TOUR activities around the grouping flow:
 * - `DRAFT` → `PENDING_GROUP` via `POST /activities/:id/promote-to-pending-group`.
 *   Signals the activity is ready to be linked to a free tour aggregation.
 * - `PENDING_GROUP` → `GROUPED` when an entry linking this activity is added to a
 *   free tour (either via `addEntry` or `from-activity` create flow).
 * - `GROUPED` → `PENDING_GROUP` when the entry is removed from the free tour
 *   (e.g. FreeTour deleted or admin unlinks the activity). The activity stays
 *   in the grouping funnel so it can be re-linked without a full demote cycle.
 * - `GROUPED` activities cannot be re-promoted directly: release the grouping first.
 *
 * `GROUPED` is the steady state for a FREE_TOUR activity currently linked to a FreeTour.
 */
export enum ActivityStatus {
	APPROVED = 'APPROVED',
	DELETED = 'DELETED',
	DRAFT = 'DRAFT',
	GROUPED = 'GROUPED',
	PENDING_GROUP = 'PENDING_GROUP',
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

// ── Included / Excluded ────────────────────────

/** Standardized catalog of items or services included in the activity price. */
export enum ActivityIncluded {
	// Tickets & access
	TICKETS_INCLUDED = 'TICKETS_INCLUDED',
	TICKETS_INCLUDED_BY_MODALITY = 'TICKETS_INCLUDED_BY_MODALITY',
	SKIP_THE_LINE = 'SKIP_THE_LINE',
	// Guides
	GUIDED_TOUR = 'GUIDED_TOUR',
	EXPERT_GUIDE = 'EXPERT_GUIDE',
	EXPERT_GUIDE_SPANISH = 'EXPERT_GUIDE_SPANISH',
	LOCAL_GUIDE_SPANISH = 'LOCAL_GUIDE_SPANISH',
	BUENDIA_TOUR_MANAGER = 'BUENDIA_TOUR_MANAGER',
	// Audio & equipment
	AUDIO_GUIDE_SPANISH = 'AUDIO_GUIDE_SPANISH',
	AUDIO_GUIDE_ENGLISH = 'AUDIO_GUIDE_ENGLISH',
	AUDIO_GUIDE_CHINESE = 'AUDIO_GUIDE_CHINESE',
	WIRELESS_RADIO_GUIDE = 'WIRELESS_RADIO_GUIDE',
	HEADPHONES = 'HEADPHONES',
	// Transport
	PRIVATE_BUS = 'PRIVATE_BUS',
	PRIVATE_BOAT = 'PRIVATE_BOAT',
	PRIVATE_TRAIN = 'PRIVATE_TRAIN',
	PRIVATE_VEHICLE = 'PRIVATE_VEHICLE',
	PUBLIC_TRANSPORT_TRAIN = 'PUBLIC_TRANSPORT_TRAIN',
	PUBLIC_TRANSPORT_BUS = 'PUBLIC_TRANSPORT_BUS',
	PUBLIC_TRANSPORT_FERRY = 'PUBLIC_TRANSPORT_FERRY',
	// Services
	HOTEL_PICKUP = 'HOTEL_PICKUP'
}

/** Standardized catalog of items or services NOT included in the activity price. */
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
