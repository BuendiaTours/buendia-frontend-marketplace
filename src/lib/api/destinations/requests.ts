import type { CriteriaResult, Destination } from '$lib/types';
import type { DestinationsGetAllParams, DestinationsSearchParams } from '$api-destinations/types';
import { get, getWithParams, post, put, del } from '$api-shared/helpers';
import { toSkipLimit } from '$api-shared/params';

const BASE = '/destinations';
const SLUG = (slug: string) => `${BASE}/slug/${slug}`;

export async function getAll(
	fetchFn: typeof fetch,
	params?: DestinationsGetAllParams
): Promise<CriteriaResult<Destination>> {
	return getWithParams<CriteriaResult<Destination>>(fetchFn, BASE, toSkipLimit(params));
}

export async function getById(fetchFn: typeof fetch, id: string): Promise<Destination> {
	return get<Destination>(fetchFn, `${BASE}/${id}`);
}

export async function getBySlug(fetchFn: typeof fetch, slug: string): Promise<Destination> {
	return get<Destination>(fetchFn, SLUG(slug));
}

export async function search(
	fetchFn: typeof fetch,
	params?: DestinationsSearchParams
): Promise<CriteriaResult<Destination>> {
	return getWithParams<CriteriaResult<Destination>>(fetchFn, `${BASE}/search`, params);
}

export async function create(fetchFn: typeof fetch, data: Partial<Destination>): Promise<void> {
	await post(fetchFn, BASE, data);
}

export async function update(
	fetchFn: typeof fetch,
	slug: string,
	data: Partial<Destination>
): Promise<void> {
	await put(fetchFn, SLUG(slug), data);
}

export async function deleteBySlug(fetchFn: typeof fetch, slug: string): Promise<void> {
	await del(fetchFn, SLUG(slug));
}
