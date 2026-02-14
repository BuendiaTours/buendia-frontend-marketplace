import type { UserKind, UserRole, UserStatus } from '$core/users/enums';

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
	sort?: string;
	order?: 'asc' | 'desc';
};
