import { createCreateLoad } from '$lib/server/backoffice/createLoad';
import { createCreateAction } from '$lib/server/backoffice/createAction';
import { locationFormSchema } from '../schemas/location-form.schema';
import { LOCATION_REQUEST } from '$core/locations/requests';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import type { PageServerLoad, Actions } from './$types';
import { v4 as uuidv4 } from 'uuid';

export const load: PageServerLoad = createCreateLoad({
	schema: zod(locationFormSchema),
	initialValues: {
		id: uuidv4(),
		name: '',
		kind: undefined,
		descriptionShort: ''
	},
	breadcrumbLabel: 'Nueva ubicación',
	entityName: 'ubicación'
});

export const actions: Actions = {
	default: createCreateAction({
		basePath: `${BACKOFFICE_PREFIX}/locations`,
		schema: zod(locationFormSchema),
		createFn: LOCATION_REQUEST.create,
		entityName: 'ubicación',
		redirectToList: true
	})
};
