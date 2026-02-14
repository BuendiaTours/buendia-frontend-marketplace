import type { FiltersSchema } from '$lib/utils/filters';
import { createOrderField, createSortField } from '$lib/utils/filters';
import type { CriteriaSortOption } from '$core/_shared/enums';
import { UserKind, UserStatus, UserSortAttribute } from '$core/users/enums';

export type UsersFilters = {
	page?: number;
	pageSize?: number;
	sort?: UserSortAttribute;
	order?: CriteriaSortOption;
	q?: string;
	email?: string;
	phone?: string;
	kind?: UserKind;
	status?: UserStatus;
};

function createStringField(key: string) {
	return {
		parse: (raw: string | null) => raw || undefined,
		serialize: (value: string | undefined, out: URLSearchParams) => {
			if (value) out.set(key, value);
			else out.delete(key);
		},
		resetPageOnChange: true
	};
}

function createSelectField<T extends string>(key: string, options: readonly T[]) {
	return {
		parse: (raw: string | null) => {
			if (raw && options.includes(raw as T)) return raw as T;
			return undefined;
		},
		serialize: (value: T | undefined, out: URLSearchParams) => {
			if (value) out.set(key, value);
			else out.delete(key);
		},
		resetPageOnChange: true
	};
}

export const usersFiltersSchema: FiltersSchema<UsersFilters> = {
	fields: {
		page: {
			parse: (raw) => {
				if (!raw) return undefined;
				const num = parseInt(raw, 10);
				return num > 0 ? num : undefined;
			},
			serialize: (value, out) => {
				if (value !== undefined) out.set('page', String(value));
				else out.delete('page');
			},
			resetPageOnChange: false
		},
		pageSize: {
			parse: (raw) => {
				if (!raw) return undefined;
				const num = parseInt(raw, 10);
				return num > 0 ? num : undefined;
			},
			serialize: (value, out) => {
				if (value !== undefined) out.set('pageSize', String(value));
				else out.delete('pageSize');
			},
			resetPageOnChange: false
		},
		sort: createSortField(Object.values(UserSortAttribute)),
		order: createOrderField(),
		q: { ...createStringField('q') },
		email: { ...createStringField('email') },
		phone: { ...createStringField('phone') },
		kind: createSelectField('kind', Object.values(UserKind)),
		status: createSelectField('status', Object.values(UserStatus))
	}
};
