import type { CriteriaResult } from '$core/_shared/types';
import { get, getWithParams, post, patch, del } from '$core/_shared/helpers';
import type {
	Destination,
	DestinationCreateDto,
	DestinationCriteria,
	DestinationUpdateDto
} from '$core/destinations/types';

const BASE = '/destinations';

export const DESTINATION_REQUEST = {
	create: (fetchFn: typeof fetch, data: DestinationCreateDto): Promise<void> =>
		post(fetchFn, BASE, data),

	update: (fetchFn: typeof fetch, id: string, data: DestinationUpdateDto): Promise<void> =>
		patch(fetchFn, `${BASE}/${id}`, data),

	delete: (fetchFn: typeof fetch, id: string): Promise<void> => del(fetchFn, `${BASE}/${id}`),

	findById: (fetchFn: typeof fetch, id: string): Promise<Destination> =>
		get<Destination>(fetchFn, `${BASE}/${id}`),

	findBySlug: (fetchFn: typeof fetch, slug: string): Promise<Destination> =>
		get<Destination>(fetchFn, `${BASE}/slug/${slug}`),

	findByCriteria: (
		fetchFn: typeof fetch,
		criteria?: DestinationCriteria
	): Promise<CriteriaResult<Destination>> =>
		getWithParams<CriteriaResult<Destination>>(fetchFn, BASE, criteria)
};
