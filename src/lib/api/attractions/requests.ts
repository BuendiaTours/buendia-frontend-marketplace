import type { CriteriaResult, Attraction } from '$lib/types';
import type { AttractionsGetAllParams, AttractionsSearchParams } from '$api-attractions/types';
import { get, getWithParams, post, put, del } from '$api-shared/helpers';
import { toSkipLimit } from '$api-shared/params';

const BASE = '/attractions';
const SLUG = (slug: string) => `${BASE}/slug/${slug}`;

export async function getAll(
	fetchFn: typeof fetch,
	params?: AttractionsGetAllParams
): Promise<CriteriaResult<Attraction>> {
	return getWithParams<CriteriaResult<Attraction>>(fetchFn, BASE, toSkipLimit(params));
}

export async function getById(fetchFn: typeof fetch, id: string): Promise<Attraction> {
	return get<Attraction>(fetchFn, `${BASE}/${id}`);
}

export async function getBySlug(fetchFn: typeof fetch, slug: string): Promise<Attraction> {
	return get<Attraction>(fetchFn, SLUG(slug));
}

export async function search(
	fetchFn: typeof fetch,
	params?: AttractionsSearchParams
): Promise<CriteriaResult<Attraction>> {
	return getWithParams<CriteriaResult<Attraction>>(fetchFn, `${BASE}/search`, params);
}

export async function create(fetchFn: typeof fetch, data: Partial<Attraction>): Promise<void> {
	await post(fetchFn, BASE, data);
}

export async function update(
	fetchFn: typeof fetch,
	slug: string,
	data: Partial<Attraction>
): Promise<void> {
	await put(fetchFn, SLUG(slug), data);
}

export async function deleteBySlug(fetchFn: typeof fetch, slug: string): Promise<void> {
	await del(fetchFn, SLUG(slug));
}
