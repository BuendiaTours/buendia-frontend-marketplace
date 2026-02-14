export type User = {
	id: string;
	email: string;
	name: string;
	phone: string;
	kind: string;
	status: string;
	roles: string[];
};

export type UserCreateDto = Omit<User, 'id' | 'status' | 'roles'>;

export type UserUpdateDto = Partial<Omit<User, 'id'>>;

export type UserCriteria = {
	page?: number;
	pageSize?: number;
	q?: string;
	email?: string;
	phone?: string;
	kind?: string;
	status?: string;
	sort?: string;
	order?: 'asc' | 'desc';
};
