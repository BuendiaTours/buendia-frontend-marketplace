import type { CriteriaResult } from '$api-shared/types';
import { get, getWithParams, post, patch, del } from '$api-shared/helpers';
import type { User, UserCreateDto, UserUpdateDto, UserCriteria } from '$api-users/types';

const BASE = '/users';

export async function findByCriteria(
	fetchFn: typeof fetch,
	criteria?: UserCriteria
): Promise<CriteriaResult<User>> {
	return getWithParams<CriteriaResult<User>>(fetchFn, BASE, criteria);
}

export async function findById(fetchFn: typeof fetch, id: string): Promise<User> {
	return get<User>(fetchFn, `${BASE}/${id}`);
}

export async function create(fetchFn: typeof fetch, data: UserCreateDto): Promise<void> {
	return post(fetchFn, BASE, data);
}

export async function update(
	fetchFn: typeof fetch,
	id: string,
	data: UserUpdateDto
): Promise<void> {
	return patch(fetchFn, `${BASE}/${id}`, data);
}

export async function remove(fetchFn: typeof fetch, id: string): Promise<void> {
	return del(fetchFn, `${BASE}/${id}`);
}
