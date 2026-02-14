import type { CriteriaResult } from '$core/_shared/types';
import { get, getWithParams, post, patch } from '$core/_shared/helpers';
import type { User, UserCreateDto, UserUpdateDto, UserCriteria } from '$core/users/types';

const BASE = '/users';

export const USER_REQUEST = {
	create: (fetchFn: typeof fetch, data: UserCreateDto): Promise<void> => post(fetchFn, BASE, data),

	update: (fetchFn: typeof fetch, id: string, data: UserUpdateDto): Promise<void> =>
		patch(fetchFn, `${BASE}/${id}`, data),

	findById: (fetchFn: typeof fetch, id: string): Promise<User> =>
		get<User>(fetchFn, `${BASE}/${id}`),

	findByCriteria: (fetchFn: typeof fetch, criteria?: UserCriteria): Promise<CriteriaResult<User>> =>
		getWithParams<CriteriaResult<User>>(fetchFn, BASE, criteria)
};
