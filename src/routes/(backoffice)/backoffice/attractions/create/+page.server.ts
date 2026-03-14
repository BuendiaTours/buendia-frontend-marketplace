/**
 * Server load and action for the attraction creation page.
 * Uses generic factories — breadcrumbs and entity name are handled by the page component.
 */
import { createCreateLoad } from '$lib/server/backoffice/createLoad';
import { createCreateAction } from '$lib/server/backoffice/createAction';
import { attractionFormSchema, type AttractionFormSchema } from '../schemas/attraction-form.schema';
import { ATTRACTION_REQUEST } from '$core/attractions/requests';
import { LOCATION_REQUEST } from '$core/locations/requests';
import { zod } from 'sveltekit-superforms/adapters';
import { AttractionStatus } from '$core/attractions/enums';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import type { PageServerLoad, Actions } from './$types';

type AvailableData = { availableLocations: Array<{ id: string; name: string }> };

export const load: PageServerLoad = createCreateLoad<AttractionFormSchema, AvailableData>({
	schema: zod(attractionFormSchema),
	initialValues: {
		name: '',
		status: AttractionStatus.DRAFT,
		description: '',
		descriptionLong: '',
		postalAddress: '',
		location: null,
		destinations: []
	},
	loadAvailableData: async (fetch) => ({
		availableLocations: (await LOCATION_REQUEST.findByCriteria(fetch)).data || []
	})
});

export const actions: Actions = {
	default: createCreateAction({
		basePath: `${BACKOFFICE_PREFIX}/attractions`,
		schema: zod(attractionFormSchema),
		createFn: ATTRACTION_REQUEST.create,
		redirectToList: true,
		transformData: ({ location, destinations, ...rest }) => ({
			...rest,
			latitude: location?.coordinates[1],
			longitude: location?.coordinates[0],
			locationIds: (destinations ?? []).map((d) => d.id)
		})
	})
};
