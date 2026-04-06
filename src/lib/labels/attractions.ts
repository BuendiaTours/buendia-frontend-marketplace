import * as m from '$paraglide/messages';
import { AttractionLocationKind } from '$core/attractions/enums';

export const ATTRACTION_LOCATION_KIND_OPTIONS = [
	{ id: AttractionLocationKind.CITY, name: m.enum_destinationKind_city() },
	{ id: AttractionLocationKind.COUNTRY, name: m.enum_destinationKind_country() },
	{ id: AttractionLocationKind.REGION, name: m.enum_destinationKind_region() }
];
