/**
 * @module free-tours/enums
 * @description Domain enums for the Free Tours resource.
 * These mirror the backend contract exactly and carry no UI or i18n dependencies.
 */

/** Attributes available for sorting free tour lists. */
export enum FreeTourSortAttribute {
	TITLE = 'title',
	CREATED_AT = 'createdAt'
}

/** Publication status of a free tour. Controls visibility in the catalog. */
export enum FreeTourStatus {
	DRAFT = 'DRAFT',
	PUBLISHED = 'PUBLISHED',
	UNPUBLISHED = 'UNPUBLISHED'
}

/** Standardized catalog of items or services included in the free tour price. */
export enum FreeTourIncluded {
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

/** Standardized catalog of items or services NOT included in the free tour price. */
export enum FreeTourExcluded {
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

/** Known restrictions that apply during the free tour. */
export enum FreeTourRestriction {
	ALCOHOL = 'ALCOHOL',
	OTHER = 'OTHER',
	PETS = 'PETS',
	SMOKING = 'SMOKING'
}

/** Type of stage within a free tour itinerary. */
export enum StageKind {
	EXPERIENCE = 'EXPERIENCE',
	TRANSFER = 'TRANSFER'
}

/** How important a stage is within the itinerary. */
export enum StageRelevance {
	HIGH = 'HIGH',
	LOW = 'LOW',
	MEDIUM = 'MEDIUM',
	NONE = 'NONE'
}

/** Whether a stage is mandatory or optional. */
export enum StageRequirement {
	NONE = 'NONE',
	OPTIONAL = 'OPTIONAL',
	REQUIRED = 'REQUIRED',
	SUGGESTED = 'SUGGESTED'
}
