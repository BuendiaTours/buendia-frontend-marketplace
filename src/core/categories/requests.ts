import type { Category } from '$core/categories/types';
import { get } from '$core/_shared/helpers';

const BASE = '/categories';

export async function getAll(fetchFn: typeof fetch): Promise<Category[]> {
	return get<Category[]>(fetchFn, BASE);
}

export async function getById(fetchFn: typeof fetch, id: string): Promise<Category> {
	return get<Category>(fetchFn, `${BASE}/${id}`);
}
