import type { CriteriaResult } from '$core/_shared/types';
import { get, getWithParams, post, patch, del } from '$core/_shared/helpers';
import type { Tag, TagCreateDto, TagCriteria, TagUpdateDto } from '$core/tags/types';

const BASE = '/tags';

export const TAG_REQUEST = {
	create: (fetchFn: typeof fetch, data: TagCreateDto): Promise<void> => post(fetchFn, BASE, data),

	update: (fetchFn: typeof fetch, id: string, data: TagUpdateDto): Promise<void> =>
		patch(fetchFn, `${BASE}/${id}`, data),

	delete: (fetchFn: typeof fetch, id: string): Promise<void> => del(fetchFn, `${BASE}/${id}`),

	findById: (fetchFn: typeof fetch, id: string): Promise<Tag> => get<Tag>(fetchFn, `${BASE}/${id}`),

	findByCriteria: (fetchFn: typeof fetch, criteria?: TagCriteria): Promise<CriteriaResult<Tag>> =>
		getWithParams<CriteriaResult<Tag>>(fetchFn, BASE, criteria)
};
