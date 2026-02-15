import type { CriteriaResult } from '$core/_shared/types';
import { get, getWithParams, post, patch, del } from '$core/_shared/helpers';
import type {
	Category,
	CategoryCreateDto,
	CategoryCriteria,
	CategoryUpdateDto
} from '$core/categories/types';

const BASE = '/categories';

export const CATEGORY_REQUEST = {
	create: (fetchFn: typeof fetch, data: CategoryCreateDto): Promise<void> =>
		post(fetchFn, BASE, data),

	update: (fetchFn: typeof fetch, id: string, data: CategoryUpdateDto): Promise<void> =>
		patch(fetchFn, `${BASE}/${id}`, data),

	delete: (fetchFn: typeof fetch, id: string): Promise<void> => del(fetchFn, `${BASE}/${id}`),

	findById: (fetchFn: typeof fetch, id: string): Promise<Category> =>
		get<Category>(fetchFn, `${BASE}/${id}`),

	findBySlug: (fetchFn: typeof fetch, slug: string): Promise<Category> =>
		get<Category>(fetchFn, `${BASE}/slug/${slug}`),

	findByCriteria: (
		fetchFn: typeof fetch,
		criteria?: CategoryCriteria
	): Promise<CriteriaResult<Category>> =>
		getWithParams<CriteriaResult<Category>>(fetchFn, BASE, criteria)
};
