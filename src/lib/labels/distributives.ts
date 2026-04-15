import { DistributiveLocationRole, DistributiveStatus } from '$core/distributives/enums';
import * as m from '$paraglide/messages';

export const DISTRIBUTIVE_STATUS_OPTIONS = [
	{ id: DistributiveStatus.DRAFT, name: m.enum_distributiveStatus_draft() },
	{ id: DistributiveStatus.PUBLISHED, name: m.enum_distributiveStatus_published() }
];

export const DISTRIBUTIVE_LOCATION_ROLE_OPTIONS = [
	{ id: DistributiveLocationRole.DESTINATION, name: m.enum_distributiveLocationRole_destination() },
	{ id: DistributiveLocationRole.ORIGIN, name: m.enum_distributiveLocationRole_origin() },
	{ id: DistributiveLocationRole.WAYPOINT, name: m.enum_distributiveLocationRole_waypoint() }
];
