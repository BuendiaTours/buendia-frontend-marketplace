import type { UserKind, UserRole, UserStatus, UserSortAttribute } from '$core/users/enums';
import type { CriteriaSortOption } from '$core/_shared/enums';

export type User = {
	id: string;
	email: string;
	name: string;
	phone: string;
	kind: UserKind;
	status: UserStatus;
	roles: UserRole[];
};

export type UserCreateDto = Omit<User, 'status' | 'roles'>;

export type UserUpdateDto = Partial<Omit<User, 'id'>>;

export type UserCriteria = {
	page?: number;
	pageSize?: number;
	q?: string;
	email?: string;
	phone?: string;
	kind?: UserKind;
	status?: UserStatus;
	sort?: UserSortAttribute;
	order?: CriteriaSortOption;
};
