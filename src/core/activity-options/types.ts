/**
 * @module activity-options/types
 * @description TypeScript type definitions for the Activity Options resource.
 * Organized into three sections:
 * - **Projections** (read models returned by the API)
 * - **DTOs** (write models sent to the API)
 * - **Criteria** (query parameters for filtering and pagination)
 */

import type {
	GroupTicketStatus,
	IndividualTicketFree,
	IndividualTicketGroup,
	IndividualTicketNeeded,
	IndividualTicketStatus,
	OptionBookingSystem,
	OptionDurationUnit,
	OptionLanguage,
	OptionPickupConfirmationType,
	OptionPickupDropOffType,
	OptionPrivacy,
	OptionSkipTheLineType,
	OptionSortAttribute,
	OptionStartingPlaceType,
	OptionStatus,
	OptionTicketKind,
	OptionWheelchair,
	PickupMinutesBefore,
	PickupPlaceKind
} from '$core/activity-options/enums';
import type { CriteriaOperator, CriteriaSortOption } from '$core/_shared/enums';
import type { Coords } from '$core/_shared/types';

// ── Shared nested types ─────────────────────────

/** Duration of an activity option. */
export type OptionDuration = {
	unit: OptionDurationUnit;
	quantity: number;
};

/** Age range for an individual ticket. */
export type AgeRange = {
	min: number | null;
	max: number | null;
};

/** Persons range for a group ticket. */
export type PersonsRange = {
	min: number;
	max: number | null;
};

/** Drop-off details within a pickup configuration. */
export type OptionPickupDropOff = {
	type: OptionPickupDropOffType;
	location?: string;
};

/** Pickup configuration for an activity option. */
export type OptionPickup = {
	kind: OptionStartingPlaceType;
	areas?: string[];
	confirmationType?: OptionPickupConfirmationType;
	description?: string;
	dropOff?: OptionPickupDropOff;
	minutesBefore?: PickupMinutesBefore;
	referenceStartTime?: string;
	transportationType?: string[];
};

// ── Projections (read models) ───────────────────

/** Individual ticket embedded in an activity option. */
export type IndividualTicket = {
	id: string;
	adultRequired: boolean;
	ageRange: AgeRange;
	commission: number;
	free: IndividualTicketFree;
	group: IndividualTicketGroup;
	price: number;
	status: IndividualTicketStatus;
	ticketNeeded: IndividualTicketNeeded;
};

/** Group ticket embedded in an activity option. */
export type GroupTicket = {
	id: string;
	commission: number;
	personsRange: PersonsRange;
	price: number;
	status: GroupTicketStatus;
};

/** Point (pickup/meeting) associated with an activity option. */
export type OptionPoint = {
	id: string;
	optionId: string;
	coords: Coords | null;
	description: string | null;
	hour: string | null;
	marginTime: number | null;
};

/** Full activity option projection as returned by the API. */
export type ActivityOption = {
	id: string;
	activityId: string;
	audios: OptionLanguage[];
	availabilityGroupId: string | null;
	bookingSystem: OptionBookingSystem;
	brochures: OptionLanguage[];
	description: string | null;
	duration: OptionDuration;
	groupTickets: GroupTicket[];
	individualTickets: IndividualTicket[];
	language: OptionLanguage;
	liveGuides: OptionLanguage[];
	maxGroupSize: number | null;
	maxTicketsPerIndividual: number | null;
	pickup: Record<string, unknown> | null;
	privacy: OptionPrivacy;
	skipTheLineType: OptionSkipTheLineType | null;
	status: OptionStatus;
	supplierOptionCode: string | null;
	ticketKind: OptionTicketKind | null;
	title: string;
	wheelchair: OptionWheelchair;
	createdAt: string;
	updatedAt: string;
};

// ── DTOs (write models) ─────────────────────────

/** Payload for creating a new activity option. */
export type ActivityOptionCreateDto = {
	id: string;
	activityId: string;
	bookingSystem: OptionBookingSystem;
	language: OptionLanguage;
	privacy: OptionPrivacy;
	title: string;
	availabilityGroupId?: string | null;
	description?: string;
	duration?: OptionDuration;
	maxGroupSize?: number;
	maxTicketsPerIndividual?: number;
	pickup?: OptionPickup;
	skipTheLineType?: OptionSkipTheLineType;
	supplierOptionCode?: string;
	ticketKind?: OptionTicketKind;
	wheelchair?: OptionWheelchair;
};

/** Payload for partially updating an existing activity option. */
export type ActivityOptionUpdateDto = {
	availabilityGroupId?: string | null;
	bookingSystem?: OptionBookingSystem;
	description?: string;
	duration?: Partial<OptionDuration>;
	language?: OptionLanguage;
	maxGroupSize?: number;
	maxTicketsPerIndividual?: number;
	pickup?: Partial<OptionPickup>;
	privacy?: OptionPrivacy;
	skipTheLineType?: OptionSkipTheLineType;
	status?: OptionStatus;
	supplierOptionCode?: string;
	ticketKind?: OptionTicketKind;
	title?: string;
	wheelchair?: OptionWheelchair;
};

/** Payload for adding an individual ticket to an option. */
export type IndividualTicketAddDto = {
	id: string;
	adultRequired: boolean;
	commission: number;
	free: IndividualTicketFree;
	group: IndividualTicketGroup;
	price: number;
	status: IndividualTicketStatus;
	ticketNeeded: IndividualTicketNeeded;
	ageRange?: AgeRange;
};

/** Payload for adding a group ticket to an option. */
export type GroupTicketAddDto = {
	id: string;
	commission: number;
	price: number;
	status: GroupTicketStatus;
	personsRange?: PersonsRange;
};

/** Payload for adding a pickup place to an option. */
export type PickupPlaceAddDto = {
	pickupLocationId: string;
	kind: PickupPlaceKind;
	minutesBefore?: number;
};

// ── Criteria (query params) ─────────────────────

/** Query parameters for filtering, sorting, and paginating activity option lists. */
export type ActivityOptionCriteria = {
	skip?: number;
	limit?: number;
	id?: string;
	activityId?: string;
	search_text?: string;
	status?: OptionStatus;
	title?: string;
	sort?: OptionSortAttribute;
	operator?: CriteriaOperator;
	order?: CriteriaSortOption;
};
