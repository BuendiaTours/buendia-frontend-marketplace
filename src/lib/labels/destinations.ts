import { DestinationKind } from '$core/destinations/enums';
import * as m from '$paraglide/messages';

export const DESTINATION_KIND_OPTIONS = [
	{ id: DestinationKind.CITY, name: m.enum_destinationKind_city() },
	{ id: DestinationKind.REGION, name: m.enum_destinationKind_region() },
	{ id: DestinationKind.COUNTRY, name: m.enum_destinationKind_country() }
];
