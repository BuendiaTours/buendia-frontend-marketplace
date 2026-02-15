import type { CriteriaResult } from '$core/_shared/types';
import { get, getWithParams, post, patch, del } from '$core/_shared/helpers';
import type {
	Activity,
	ActivityCreateDto,
	ActivityCriteria,
	ActivityMealAddDto,
	ActivityMultimediaAddDto,
	ActivityStageAddDto,
	ActivityUpdateDto
} from '$core/activities/types';

const BASE = '/activities';

export const ACTIVITY_REQUEST = {
	// --- CRUD ---

	create: (fetchFn: typeof fetch, data: ActivityCreateDto): Promise<void> =>
		post(fetchFn, BASE, data),

	update: (fetchFn: typeof fetch, id: string, data: ActivityUpdateDto): Promise<void> =>
		patch(fetchFn, `${BASE}/${id}`, data),

	delete: (fetchFn: typeof fetch, id: string): Promise<void> => del(fetchFn, `${BASE}/${id}`),

	findById: (fetchFn: typeof fetch, id: string): Promise<Activity> =>
		get<Activity>(fetchFn, `${BASE}/${id}`),

	findBySlug: (fetchFn: typeof fetch, slug: string): Promise<Activity> =>
		get<Activity>(fetchFn, `${BASE}/slug/${slug}`),

	findByCriteria: (
		fetchFn: typeof fetch,
		criteria?: ActivityCriteria
	): Promise<CriteriaResult<Activity>> =>
		getWithParams<CriteriaResult<Activity>>(fetchFn, BASE, criteria),

	// --- Attractions ---

	addAttraction: (fetchFn: typeof fetch, id: string, attractionId: string): Promise<void> =>
		post(fetchFn, `${BASE}/${id}/attractions/${attractionId}`, {}),

	removeAttraction: (fetchFn: typeof fetch, id: string, attractionId: string): Promise<void> =>
		del(fetchFn, `${BASE}/${id}/attractions/${attractionId}`),

	// --- Categories ---

	addCategory: (fetchFn: typeof fetch, id: string, categoryId: string): Promise<void> =>
		post(fetchFn, `${BASE}/${id}/categories/${categoryId}`, {}),

	removeCategory: (fetchFn: typeof fetch, id: string, categoryId: string): Promise<void> =>
		del(fetchFn, `${BASE}/${id}/categories/${categoryId}`),

	// --- Destinations ---

	addDestination: (fetchFn: typeof fetch, id: string, destinationId: string): Promise<void> =>
		post(fetchFn, `${BASE}/${id}/destinations/${destinationId}`, {}),

	removeDestination: (fetchFn: typeof fetch, id: string, destinationId: string): Promise<void> =>
		del(fetchFn, `${BASE}/${id}/destinations/${destinationId}`),

	// --- Distributives ---

	addDistributive: (fetchFn: typeof fetch, id: string, distributiveId: string): Promise<void> =>
		post(fetchFn, `${BASE}/${id}/distributives/${distributiveId}`, {}),

	removeDistributive: (fetchFn: typeof fetch, id: string, distributiveId: string): Promise<void> =>
		del(fetchFn, `${BASE}/${id}/distributives/${distributiveId}`),

	// --- Meals ---

	addMeal: (fetchFn: typeof fetch, id: string, data: ActivityMealAddDto): Promise<void> =>
		post(fetchFn, `${BASE}/${id}/meals/${data.id}`, data),

	removeMeal: (fetchFn: typeof fetch, id: string, mealId: string): Promise<void> =>
		del(fetchFn, `${BASE}/${id}/meals/${mealId}`),

	// --- Multimedias ---

	addMultimedia: (
		fetchFn: typeof fetch,
		id: string,
		data: ActivityMultimediaAddDto
	): Promise<void> => post(fetchFn, `${BASE}/${id}/multimedias/${data.id}`, data),

	removeMultimedia: (fetchFn: typeof fetch, id: string, multimediaId: string): Promise<void> =>
		del(fetchFn, `${BASE}/${id}/multimedias/${multimediaId}`),

	// --- Stages ---

	addStage: (fetchFn: typeof fetch, id: string, data: ActivityStageAddDto): Promise<void> =>
		post(fetchFn, `${BASE}/${id}/stages/${data.id}`, data),

	removeStage: (fetchFn: typeof fetch, id: string, stageId: string): Promise<void> =>
		del(fetchFn, `${BASE}/${id}/stages/${stageId}`)
};
