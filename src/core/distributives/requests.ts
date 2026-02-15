import type { CriteriaResult } from '$core/_shared/types';
import { get, getWithParams, post, patch, del } from '$core/_shared/helpers';
import type {
	Distributive,
	DistributiveCreateDto,
	DistributiveCriteria,
	DistributiveUpdateDto
} from '$core/distributives/types';

const BASE = '/distributives';

export const DISTRIBUTIVE_REQUEST = {
	create: (fetchFn: typeof fetch, data: DistributiveCreateDto): Promise<void> =>
		post(fetchFn, BASE, data),

	update: (fetchFn: typeof fetch, id: string, data: DistributiveUpdateDto): Promise<void> =>
		patch(fetchFn, `${BASE}/${id}`, data),

	delete: (fetchFn: typeof fetch, id: string): Promise<void> => del(fetchFn, `${BASE}/${id}`),

	findById: (fetchFn: typeof fetch, id: string): Promise<Distributive> =>
		get<Distributive>(fetchFn, `${BASE}/${id}`),

	findBySlug: (fetchFn: typeof fetch, slug: string): Promise<Distributive> =>
		get<Distributive>(fetchFn, `${BASE}/slug/${slug}`),

	findByCriteria: (
		fetchFn: typeof fetch,
		criteria?: DistributiveCriteria
	): Promise<CriteriaResult<Distributive>> =>
		getWithParams<CriteriaResult<Distributive>>(fetchFn, BASE, criteria)
};
