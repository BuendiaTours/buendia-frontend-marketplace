import { AttractionStatus } from '$core/attractions/enums';
import * as m from '$paraglide/messages';

export const ATTRACTION_STATUS_OPTIONS = [
	{ id: AttractionStatus.ACTIVE, name: m.enum_attractionStatus_active() },
	{ id: AttractionStatus.DRAFT, name: m.enum_attractionStatus_draft() },
	{ id: AttractionStatus.INACTIVE, name: m.enum_attractionStatus_inactive() }
];
