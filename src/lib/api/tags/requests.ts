import type { Tag } from '$api-tags/types';
import { get } from '$api-shared/helpers';

const BASE = '/tags';

export async function getAll(fetchFn: typeof fetch): Promise<Tag[]> {
	return get<Tag[]>(fetchFn, BASE);
}

export async function getById(fetchFn: typeof fetch, id: string): Promise<Tag> {
	return get<Tag>(fetchFn, `${BASE}/${id}`);
}
