/**
 * UI labels for activity option enums.
 * Translations of domain enums for dropdowns, selects, and display.
 */

import {
	GroupTicketStatus,
	IndividualTicketFree,
	IndividualTicketGroup,
	IndividualTicketNeeded,
	IndividualTicketStatus,
	OptionBookingSystem,
	OptionDurationUnit,
	OptionIntegrationStatus,
	OptionLanguage,
	OptionPrivacy,
	OptionSkipTheLineType,
	OptionStatus,
	OptionTicketKind,
	OptionWheelchair,
	PickupPlaceKind
} from '$core/activity-options/enums';
import * as m from '$paraglide/messages';

export const OPTION_BOOKING_SYSTEM_OPTIONS = [
	{ id: OptionBookingSystem.BOKUN, name: m.enum_optionBookingSystem_bokun() },
	{ id: OptionBookingSystem.TURITOP, name: m.enum_optionBookingSystem_turitop() },
	{ id: OptionBookingSystem.TOUR_CMS, name: m.enum_optionBookingSystem_tourCms() }
];

export const OPTION_INTEGRATION_STATUS_OPTIONS = [
	{ id: OptionIntegrationStatus.PENDING, name: m.enum_optionIntegrationStatus_pending() },
	{ id: OptionIntegrationStatus.UNNECESSARY, name: m.enum_optionIntegrationStatus_unnecessary() },
	{
		id: OptionIntegrationStatus.ACTIVITY_INDEXED,
		name: m.enum_optionIntegrationStatus_activityIndexed()
	},
	{ id: OptionIntegrationStatus.COMPLETED, name: m.enum_optionIntegrationStatus_completed() }
];

export const OPTION_LANGUAGE_OPTIONS = [
	{ id: OptionLanguage.ES, name: m.enum_optionLanguage_es() },
	{ id: OptionLanguage.EN, name: m.enum_optionLanguage_en() },
	{ id: OptionLanguage.FR, name: m.enum_optionLanguage_fr() },
	{ id: OptionLanguage.DE, name: m.enum_optionLanguage_de() },
	{ id: OptionLanguage.IT, name: m.enum_optionLanguage_it() },
	{ id: OptionLanguage.PT, name: m.enum_optionLanguage_pt() },
	{ id: OptionLanguage.NL, name: m.enum_optionLanguage_nl() },
	{ id: OptionLanguage.RU, name: m.enum_optionLanguage_ru() },
	{ id: OptionLanguage.ZH, name: m.enum_optionLanguage_zh() },
	{ id: OptionLanguage.JA, name: m.enum_optionLanguage_ja() },
	{ id: OptionLanguage.KO, name: m.enum_optionLanguage_ko() },
	{ id: OptionLanguage.AR, name: m.enum_optionLanguage_ar() }
];

export const OPTION_PRIVACY_OPTIONS = [
	{ id: OptionPrivacy.PUBLIC, name: m.enum_optionPrivacy_public() },
	{ id: OptionPrivacy.PRIVATE, name: m.enum_optionPrivacy_private() }
];

export const OPTION_STATUS_OPTIONS = [
	{ id: OptionStatus.APPROVED, name: m.enum_optionStatus_approved() },
	{ id: OptionStatus.DELETED, name: m.enum_optionStatus_deleted() },
	{ id: OptionStatus.DRAFT, name: m.enum_optionStatus_draft() },
	{ id: OptionStatus.PENDING_REVIEW, name: m.enum_optionStatus_pendingReview() },
	{ id: OptionStatus.PUBLISHED, name: m.enum_optionStatus_published() },
	{ id: OptionStatus.REJECTED, name: m.enum_optionStatus_rejected() },
	{ id: OptionStatus.UNPUBLISHED, name: m.enum_optionStatus_unpublished() }
];

export const OPTION_DURATION_UNIT_OPTIONS = [
	{ id: OptionDurationUnit.MINUTES, name: m.enum_optionDurationUnit_minutes() },
	{ id: OptionDurationUnit.HOURS, name: m.enum_optionDurationUnit_hours() },
	{ id: OptionDurationUnit.DAYS, name: m.enum_optionDurationUnit_days() }
];

export const OPTION_WHEELCHAIR_OPTIONS = [
	{ id: OptionWheelchair.ACCESSIBLE, name: m.enum_optionWheelchair_accessible() },
	{ id: OptionWheelchair.NOT_ACCESSIBLE, name: m.enum_optionWheelchair_notAccessible() }
];

export const OPTION_TICKET_KIND_OPTIONS = [
	{ id: OptionTicketKind.INDIVIDUAL, name: m.enum_optionTicketKind_individual() },
	{ id: OptionTicketKind.GROUP, name: m.enum_optionTicketKind_group() }
];

export const OPTION_SKIP_THE_LINE_OPTIONS = [
	{
		id: OptionSkipTheLineType.SKIP_THE_LINE_TO_GET_TICKETS,
		name: m.enum_optionSkipTheLine_skipToGetTickets()
	},
	{
		id: OptionSkipTheLineType.SEPARATE_ENTRANCE,
		name: m.enum_optionSkipTheLine_separateEntrance()
	},
	{
		id: OptionSkipTheLineType.EXPRESS_SECURITY_CHECK,
		name: m.enum_optionSkipTheLine_expressSecurityCheck()
	},
	{
		id: OptionSkipTheLineType.EXPRESS_ELEVATORS,
		name: m.enum_optionSkipTheLine_expressElevators()
	},
	{ id: OptionSkipTheLineType.NO_SKIP_THE_LINE, name: m.enum_optionSkipTheLine_noSkipTheLine() }
];

export const PICKUP_PLACE_KIND_OPTIONS = [
	{ id: PickupPlaceKind.PICKUP, name: m.enum_pickupPlaceKind_pickup() },
	{ id: PickupPlaceKind.DROPOFF, name: m.enum_pickupPlaceKind_dropoff() }
];

export const INDIVIDUAL_TICKET_STATUS_OPTIONS = [
	{ id: IndividualTicketStatus.ACTIVE, name: m.enum_individualTicketStatus_active() },
	{ id: IndividualTicketStatus.INACTIVE, name: m.enum_individualTicketStatus_inactive() }
];

export const INDIVIDUAL_TICKET_GROUP_OPTIONS = [
	{ id: IndividualTicketGroup.ADULT, name: m.enum_individualTicketGroup_adult() },
	{ id: IndividualTicketGroup.CHILD, name: m.enum_individualTicketGroup_child() },
	{ id: IndividualTicketGroup.CITIZEN_EU, name: m.enum_individualTicketGroup_citizenEu() },
	{ id: IndividualTicketGroup.INFANT, name: m.enum_individualTicketGroup_infant() },
	{ id: IndividualTicketGroup.SENIOR, name: m.enum_individualTicketGroup_senior() },
	{ id: IndividualTicketGroup.STUDENT, name: m.enum_individualTicketGroup_student() },
	{ id: IndividualTicketGroup.STUDENT_EU, name: m.enum_individualTicketGroup_studentEu() },
	{ id: IndividualTicketGroup.YOUTH, name: m.enum_individualTicketGroup_youth() },
	{ id: IndividualTicketGroup.ALL, name: m.enum_individualTicketGroup_all() }
];

export const INDIVIDUAL_TICKET_FREE_OPTIONS = [
	{ id: IndividualTicketFree.YES, name: m.enum_individualTicketFree_yes() },
	{ id: IndividualTicketFree.NO, name: m.enum_individualTicketFree_no() },
	{ id: IndividualTicketFree.NOT_APPLY, name: m.enum_individualTicketFree_notApply() }
];

export const INDIVIDUAL_TICKET_NEEDED_OPTIONS = [
	{ id: IndividualTicketNeeded.YES, name: m.enum_individualTicketNeeded_yes() },
	{ id: IndividualTicketNeeded.NO, name: m.enum_individualTicketNeeded_no() },
	{ id: IndividualTicketNeeded.NOT_APPLY, name: m.enum_individualTicketNeeded_notApply() }
];

export const GROUP_TICKET_STATUS_OPTIONS = [
	{ id: GroupTicketStatus.ACTIVE, name: m.enum_groupTicketStatus_active() },
	{ id: GroupTicketStatus.INACTIVE, name: m.enum_groupTicketStatus_inactive() }
];
