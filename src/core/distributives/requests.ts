import type { Distributive } from '$core/distributives/types';
import { get } from '$core/_shared/helpers';

const BASE = '/distributives';

export async function getAll(fetchFn: typeof fetch): Promise<Distributive[]> {
	return get<Distributive[]>(fetchFn, BASE);
}

export async function getById(fetchFn: typeof fetch, id: string): Promise<Distributive> {
	return get<Distributive>(fetchFn, `${BASE}/${id}`);
}
