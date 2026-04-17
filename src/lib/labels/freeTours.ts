import {
	FreeTourExcluded,
	FreeTourIncluded,
	FreeTourRestriction,
	FreeTourStatus
} from '$core/free-tours/enums';
import * as m from '$paraglide/messages';

export const FREE_TOUR_STATUS_OPTIONS = [
	{ id: FreeTourStatus.DRAFT, name: m.enum_freeTourStatus_draft() },
	{ id: FreeTourStatus.PUBLISHED, name: m.enum_freeTourStatus_published() },
	{ id: FreeTourStatus.UNPUBLISHED, name: m.enum_freeTourStatus_unpublished() }
];

export const FREE_TOUR_INCLUDED_OPTIONS = [
	{ id: FreeTourIncluded.TICKETS_INCLUDED, name: m.enum_activityIncluded_ticketsIncluded() },
	{
		id: FreeTourIncluded.TICKETS_INCLUDED_BY_MODALITY,
		name: m.enum_activityIncluded_ticketsIncludedByModality()
	},
	{ id: FreeTourIncluded.SKIP_THE_LINE, name: m.enum_activityIncluded_skipTheLine() },
	{ id: FreeTourIncluded.GUIDED_TOUR, name: m.enum_activityIncluded_guidedTour() },
	{ id: FreeTourIncluded.EXPERT_GUIDE, name: m.enum_activityIncluded_expertGuide() },
	{ id: FreeTourIncluded.EXPERT_GUIDE_SPANISH, name: m.enum_activityIncluded_expertGuideSpanish() },
	{ id: FreeTourIncluded.LOCAL_GUIDE_SPANISH, name: m.enum_activityIncluded_localGuideSpanish() },
	{ id: FreeTourIncluded.BUENDIA_TOUR_MANAGER, name: m.enum_activityIncluded_buendiaTourManager() },
	{ id: FreeTourIncluded.AUDIO_GUIDE_SPANISH, name: m.enum_activityIncluded_audioGuideSpanish() },
	{ id: FreeTourIncluded.AUDIO_GUIDE_ENGLISH, name: m.enum_activityIncluded_audioGuideEnglish() },
	{ id: FreeTourIncluded.AUDIO_GUIDE_CHINESE, name: m.enum_activityIncluded_audioGuideChinese() },
	{ id: FreeTourIncluded.WIRELESS_RADIO_GUIDE, name: m.enum_activityIncluded_wirelessRadioGuide() },
	{ id: FreeTourIncluded.HEADPHONES, name: m.enum_activityIncluded_headphones() },
	{ id: FreeTourIncluded.PRIVATE_BUS, name: m.enum_activityIncluded_privateBus() },
	{ id: FreeTourIncluded.PRIVATE_BOAT, name: m.enum_activityIncluded_privateBoat() },
	{ id: FreeTourIncluded.PRIVATE_TRAIN, name: m.enum_activityIncluded_privateTrain() },
	{ id: FreeTourIncluded.PRIVATE_VEHICLE, name: m.enum_activityIncluded_privateVehicle() },
	{
		id: FreeTourIncluded.PUBLIC_TRANSPORT_TRAIN,
		name: m.enum_activityIncluded_publicTransportTrain()
	},
	{ id: FreeTourIncluded.PUBLIC_TRANSPORT_BUS, name: m.enum_activityIncluded_publicTransportBus() },
	{
		id: FreeTourIncluded.PUBLIC_TRANSPORT_FERRY,
		name: m.enum_activityIncluded_publicTransportFerry()
	},
	{ id: FreeTourIncluded.HOTEL_PICKUP, name: m.enum_activityIncluded_hotelPickup() }
];

export const FREE_TOUR_EXCLUDED_OPTIONS = [
	{
		id: FreeTourExcluded.TRANSPORT_TO_MEETING_POINT,
		name: m.enum_activityExcluded_transportToMeetingPoint()
	},
	{ id: FreeTourExcluded.TICKETS, name: m.enum_activityExcluded_tickets() },
	{ id: FreeTourExcluded.TRANSPORT_TICKET, name: m.enum_activityExcluded_transportTicket() },
	{ id: FreeTourExcluded.GUIDED_TOUR, name: m.enum_activityExcluded_guidedTour() },
	{ id: FreeTourExcluded.INTERIOR_VISITS, name: m.enum_activityExcluded_interiorVisits() },
	{ id: FreeTourExcluded.FOOD_AND_DRINKS, name: m.enum_activityExcluded_foodAndDrinks() },
	{ id: FreeTourExcluded.TIPS, name: m.enum_activityExcluded_tips() },
	{ id: FreeTourExcluded.HEADPHONES, name: m.enum_activityExcluded_headphones() },
	{ id: FreeTourExcluded.SPORTS_EQUIPMENT, name: m.enum_activityExcluded_sportsEquipment() },
	{ id: FreeTourExcluded.OTHER, name: m.enum_activityExcluded_other() }
];

export const FREE_TOUR_RESTRICTION_OPTIONS = [
	{ id: FreeTourRestriction.ALCOHOL, name: m.enum_activityRestriction_alcohol() },
	{ id: FreeTourRestriction.SMOKING, name: m.enum_activityRestriction_smoking() },
	{ id: FreeTourRestriction.PETS, name: m.enum_activityRestriction_pets() },
	{ id: FreeTourRestriction.OTHER, name: m.enum_activityRestriction_other() }
];
