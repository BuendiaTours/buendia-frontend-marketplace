/**
 * Server load and action for the location creation page.
 * Uses generic factories — breadcrumbs and entity name are handled by the page component.
 */
import { createCreateLoad } from '$lib/server/backoffice/createLoad';
import { createCreateAction } from '$lib/server/backoffice/createAction';
import { locationFormSchema } from '../schemas/location-form.schema';
import { LOCATION_REQUEST } from '$core/locations/requests';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = createCreateLoad({
	schema: zod(locationFormSchema),
	initialValues: {
		name: '',
		kind: undefined,
		descriptionShort: ''
	}
});

export const actions: Actions = {
	default: createCreateAction({
		basePath: `${BACKOFFICE_PREFIX}/locations`,
		schema: zod(locationFormSchema),
		createFn: LOCATION_REQUEST.create,
		redirectToList: true
	})
};
