/**
 * Server load and action for the free tour creation page.
 */
import { createCreateLoad } from '$lib/server/backoffice/createLoad';
import { createCreateAction } from '$lib/server/backoffice/createAction';
import { freeTourFormSchema, type FreeTourFormSchema } from '../schemas/free-tour-form.schema';
import { FREE_TOUR_REQUEST } from '$core/free-tours/requests';
import { CATEGORY_REQUEST } from '$core/categories/requests';
import { LOCATION_REQUEST } from '$core/locations/requests';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import type { PageServerLoad, Actions } from './$types';

type AvailableData = {
	availableCategories: Array<{ id: string; name: string }>;
	availableDestinations: Array<{ id: string; name: string }>;
};

export const load: PageServerLoad = createCreateLoad<FreeTourFormSchema, AvailableData>({
	schema: zod(freeTourFormSchema),
	initialValues: {
		title: '',
		slug: '',
		descriptionShort: '',
		descriptionFull: '',
		categories: [],
		destinations: []
	},
	loadAvailableData: async (fetch) => {
		const [categoriesRes, locationsRes] = await Promise.all([
			CATEGORY_REQUEST.findByCriteria(fetch, { limit: 200 }),
			LOCATION_REQUEST.findByCriteria(fetch, { limit: 200 })
		]);
		return {
			availableCategories: categoriesRes.data.map((c) => ({ id: c.id, name: c.name })),
			availableDestinations: locationsRes.data.map((l) => ({ id: l.id, name: l.name }))
		};
	}
});

export const actions: Actions = {
	default: createCreateAction({
		basePath: `${BACKOFFICE_PREFIX}/free-tours`,
		schema: zod(freeTourFormSchema),
		createFn: FREE_TOUR_REQUEST.create,
		redirectToList: true,
		transformData: (formData) => ({
			id: formData.id,
			title: formData.title,
			slug: formData.slug,
			descriptionShort: formData.descriptionShort,
			descriptionFull: formData.descriptionFull,
			categoryIds: (formData.categories ?? []).map((c) => c.id),
			destinationIds: (formData.destinations ?? []).map((d) => d.id)
		})
	})
};
