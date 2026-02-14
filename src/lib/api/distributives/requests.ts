import type { Distributive } from '$api-distributives/types';
import { get } from '$api-shared/helpers';

const BASE = '/distributives';

export async function getAll(fetchFn: typeof fetch): Promise<Distributive[]> {
	return get<Distributive[]>(fetchFn, BASE);
}

export async function getById(fetchFn: typeof fetch, id: string): Promise<Distributive> {
	return get<Distributive>(fetchFn, `${BASE}/${id}`);
}
