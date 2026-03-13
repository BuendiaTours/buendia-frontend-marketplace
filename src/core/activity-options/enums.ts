/**
 * @module activity-options/enums
 * @description Domain enums for the Activity Options resource.
 * These mirror the backend contract exactly and carry no UI or i18n dependencies.
 */

// ── Option ──────────────────────────────────────

/** External booking system that manages this option. */
export enum OptionBookingSystem {
	BOKUN = 'BOKUN',
	TURITOP = 'TURITOP',
	TOUR_CMS = 'TOUR_CMS'
}

/** Duration unit for an activity option. */
export enum OptionDurationUnit {
	MINUTES = 'MINUTES',
	HOURS = 'HOURS',
	DAYS = 'DAYS'
}

/** Language available for an option (guides, audios, brochures). */
export enum OptionLanguage {
	ES = 'ES',
	EN = 'EN',
	FR = 'FR',
	DE = 'DE',
	IT = 'IT',
	PT = 'PT',
	NL = 'NL',
	RU = 'RU',
	ZH = 'ZH',
	JA = 'JA',
	KO = 'KO',
	AR = 'AR'
}

/** Privacy level of an option. */
export enum OptionPrivacy {
	PUBLIC = 'PUBLIC',
	PRIVATE = 'PRIVATE'
}

/** Publication lifecycle status of an option. */
export enum OptionStatus {
	APPROVED = 'APPROVED',
	DELETED = 'DELETED',
	DRAFT = 'DRAFT',
	PENDING_REVIEW = 'PENDING_REVIEW',
	PUBLISHED = 'PUBLISHED',
	REJECTED = 'REJECTED',
	UNPUBLISHED = 'UNPUBLISHED'
}

/** Wheelchair accessibility of an option. */
export enum OptionWheelchair {
	ACCESSIBLE = 'ACCESSIBLE',
	NOT_ACCESSIBLE = 'NOT_ACCESSIBLE'
}

/** Skip-the-line benefit type. */
export enum OptionSkipTheLineType {
	SKIP_THE_LINE_TO_GET_TICKETS = 'SKIP_THE_LINE_TO_GET_TICKETS',
	SEPARATE_ENTRANCE = 'SEPARATE_ENTRANCE',
	EXPRESS_SECURITY_CHECK = 'EXPRESS_SECURITY_CHECK',
	EXPRESS_ELEVATORS = 'EXPRESS_ELEVATORS',
	NO_SKIP_THE_LINE = 'NO_SKIP_THE_LINE'
}

/** Ticket pricing model for an option. */
export enum OptionTicketKind {
	INDIVIDUAL = 'INDIVIDUAL',
	GROUP = 'GROUP'
}

// ── Pickup ──────────────────────────────────────

/** Type of starting place for pickup. */
export enum OptionStartingPlaceType {
	MEETING_POINT = 'MEETING_POINT',
	AREA = 'AREA',
	LIST_OF_LOCATIONS = 'LIST_OF_LOCATIONS'
}

/** Drop-off policy relative to pickup. */
export enum OptionPickupDropOffType {
	SAME_PLACE = 'SAME_PLACE',
	DIFFERENT_PLACE = 'DIFFERENT_PLACE',
	NO_DROP_OFF = 'NO_DROP_OFF'
}

/** How pickup confirmation is communicated. */
export enum OptionPickupConfirmationType {
	DAY_BEFORE = 'DAY_BEFORE',
	ON_SELECT_PICKUP_LOCATION = 'ON_SELECT_PICKUP_LOCATION'
}

/** Minutes before activity start for pickup arrival. */
export enum PickupMinutesBefore {
	NOT_APPLY = 'NOT_APPLY',
	FIVE = 'FIVE',
	TEN = 'TEN',
	FIFTEEN = 'FIFTEEN',
	TWENTY = 'TWENTY',
	TWENTY_FIVE = 'TWENTY_FIVE',
	THIRTY = 'THIRTY'
}

/** Kind of usage of a pickup place (pickup or dropoff). */
export enum PickupPlaceKind {
	PICKUP = 'PICKUP',
	DROPOFF = 'DROPOFF'
}

// ── Individual Tickets ──────────────────────────

/** Status of an individual ticket. */
export enum IndividualTicketStatus {
	ACTIVE = 'ACTIVE',
	INACTIVE = 'INACTIVE'
}

/** Audience group for an individual ticket. */
export enum IndividualTicketGroup {
	ADULT = 'ADULT',
	CHILD = 'CHILD',
	CITIZEN_EU = 'CITIZEN_EU',
	INFANT = 'INFANT',
	SENIOR = 'SENIOR',
	STUDENT = 'STUDENT',
	STUDENT_EU = 'STUDENT_EU',
	YOUTH = 'YOUTH',
	ALL = 'ALL'
}

/** Whether an individual ticket is free. */
export enum IndividualTicketFree {
	YES = 'YES',
	NO = 'NO',
	NOT_APPLY = 'NOT_APPLY'
}

/** Whether a physical/digital ticket is needed. */
export enum IndividualTicketNeeded {
	YES = 'YES',
	NO = 'NO',
	NOT_APPLY = 'NOT_APPLY'
}

// ── Group Tickets ───────────────────────────────

/** Status of a group ticket. */
export enum GroupTicketStatus {
	ACTIVE = 'ACTIVE',
	INACTIVE = 'INACTIVE'
}

// ── Sort ────────────────────────────────────────

/** Attributes available for sorting activity option lists. */
export enum OptionSortAttribute {
	TITLE = 'title',
	CREATED_AT = 'createdAt',
	UPDATED_AT = 'updatedAt'
}
