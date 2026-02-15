import type { CriteriaResult } from '$core/_shared/types';
import { get, getWithParams, post, patch, del } from '$core/_shared/helpers';
import type {
	Attraction,
	AttractionCreateDto,
	AttractionCriteria,
	AttractionUpdateDto
} from '$core/attractions/types';

const BASE = '/attractions';

export const ATTRACTION_REQUEST = {
	create: (fetchFn: typeof fetch, data: AttractionCreateDto): Promise<void> =>
		post(fetchFn, BASE, data),

	update: (fetchFn: typeof fetch, id: string, data: AttractionUpdateDto): Promise<void> =>
		patch(fetchFn, `${BASE}/${id}`, data),

	delete: (fetchFn: typeof fetch, id: string): Promise<void> => del(fetchFn, `${BASE}/${id}`),

	findById: (fetchFn: typeof fetch, id: string): Promise<Attraction> =>
		get<Attraction>(fetchFn, `${BASE}/${id}`),

	findBySlug: (fetchFn: typeof fetch, slug: string): Promise<Attraction> =>
		get<Attraction>(fetchFn, `${BASE}/slug/${slug}`),

	findByCriteria: (
		fetchFn: typeof fetch,
		criteria?: AttractionCriteria
	): Promise<CriteriaResult<Attraction>> =>
		getWithParams<CriteriaResult<Attraction>>(fetchFn, BASE, criteria)
};
