import { FreeTourStatus } from '$core/free-tours/enums';
import * as m from '$paraglide/messages';

export const FREE_TOUR_STATUS_OPTIONS = [
	{ id: FreeTourStatus.DRAFT, name: m.enum_freeTourStatus_draft() },
	{ id: FreeTourStatus.PUBLISHED, name: m.enum_freeTourStatus_published() },
	{ id: FreeTourStatus.UNPUBLISHED, name: m.enum_freeTourStatus_unpublished() }
];
