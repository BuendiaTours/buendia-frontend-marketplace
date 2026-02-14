import { UserKind, UserRole, UserStatus } from '$core/users/enums';
import * as m from '$paraglide/messages';

export const USER_KIND_OPTIONS = [
	{ id: UserKind.CLIENT, name: m.enum_userKind_client() },
	{ id: UserKind.ADMIN, name: m.enum_userKind_admin() }
];

export const USER_ROLE_OPTIONS = [
	{ id: UserRole.SUPPLY, name: m.enum_userRole_supply() },
	{ id: UserRole.CUSTOMER_ATTENDANT, name: m.enum_userRole_customerAttendant() },
	{ id: UserRole.FINANCES, name: m.enum_userRole_finances() },
	{ id: UserRole.CONTENT, name: m.enum_userRole_content() }
];

export const USER_STATUS_OPTIONS = [
	{ id: UserStatus.ACTIVE, name: m.enum_userStatus_active() },
	{ id: UserStatus.INACTIVE, name: m.enum_userStatus_inactive() },
	{ id: UserStatus.SUSPENDED, name: m.enum_userStatus_suspended() }
];
