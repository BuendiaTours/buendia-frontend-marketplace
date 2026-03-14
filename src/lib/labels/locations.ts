/**
 * UI label mappings for location enums.
 * Maps LocationKind values to their i18n-translated display names for selects and filters.
 */
import { LocationKind } from '$core/locations/enums';
import * as m from '$paraglide/messages';

export const LOCATION_KIND_OPTIONS = [
	{ id: LocationKind.CITY, name: m.enum_locationKind_city() },
	{ id: LocationKind.REGION, name: m.enum_locationKind_region() },
	{ id: LocationKind.COUNTRY, name: m.enum_locationKind_country() }
];
