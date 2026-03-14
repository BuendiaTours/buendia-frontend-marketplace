/**
 * Server load and action for the location creation page.
 * Uses generic factories — breadcrumbs and entity name are handled by the page component.
 */
import { createCreateLoad } from '$lib/server/backoffice/createLoad';
import { createCreateAction } from '$lib/server/backoffice/createAction';
import { locationFormSchema, type LocationFormSchema } from '../schemas/location-form.schema';
import { LOCATION_REQUEST } from '$core/locations/requests';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = createCreateLoad<LocationFormSchema>({
	schema: zod(locationFormSchema),
	initialValues: {
		name: '',
		kind: undefined,
		descriptionShort: '',
		location: null
	}
});

export const actions: Actions = {
	default: createCreateAction({
		basePath: `${BACKOFFICE_PREFIX}/locations`,
		schema: zod(locationFormSchema),
		createFn: LOCATION_REQUEST.create,
		redirectToList: true,
		// Convert GeoJSON point to flat lat/lng for the API
		transformData: ({ location, ...rest }) => ({
			...rest,
			latitude: location?.coordinates[1],
			longitude: location?.coordinates[0]
		})
	})
};
