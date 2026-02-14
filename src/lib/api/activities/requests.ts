import type { CriteriaResult, ActivityListItem } from '$lib/types';
import type { ActivitiesGetAllParams } from '$api-activities/types';
import { get, getWithParams, post, put, del } from '$api-shared/helpers';
import { toSkipLimit } from '$api-shared/params';

const BASE = '/activities';
const SLUG = (slug: string) => `${BASE}/slug/${slug}`;

export async function getAll(
	fetchFn: typeof fetch,
	params?: ActivitiesGetAllParams
): Promise<CriteriaResult<ActivityListItem>> {
	return getWithParams<CriteriaResult<ActivityListItem>>(fetchFn, BASE, toSkipLimit(params));
}

export async function getBySlug(fetchFn: typeof fetch, slug: string): Promise<ActivityListItem> {
	return get<ActivityListItem>(fetchFn, SLUG(slug));
}

export async function create(
	fetchFn: typeof fetch,
	data: Partial<ActivityListItem>
): Promise<void> {
	await post(fetchFn, BASE, data);
}

export async function update(
	fetchFn: typeof fetch,
	slug: string,
	data: Partial<ActivityListItem>
): Promise<void> {
	await put(fetchFn, SLUG(slug), data);
}

export async function deleteBySlug(fetchFn: typeof fetch, slug: string): Promise<void> {
	await del(fetchFn, SLUG(slug));
}
