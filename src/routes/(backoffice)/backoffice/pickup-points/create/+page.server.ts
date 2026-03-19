/**
 * Server load and action for the pickup point creation page.
 */
import { createCreateLoad } from '$lib/server/backoffice/createLoad';
import { createCreateAction } from '$lib/server/backoffice/createAction';
import {
	pickupPointFormSchema,
	type PickupPointFormSchema
} from '../schemas/pickup-point-form.schema';
import { PICKUP_POINT_REQUEST } from '$core/pickup-points/requests';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = createCreateLoad<PickupPointFormSchema>({
	schema: zod(pickupPointFormSchema),
	initialValues: {
		name: '',
		address: '',
		city: '',
		postCode: '',
		countryCode: '',
		location: null
	}
});

export const actions: Actions = {
	default: createCreateAction({
		basePath: `${BACKOFFICE_PREFIX}/pickup-points`,
		schema: zod(pickupPointFormSchema),
		createFn: PICKUP_POINT_REQUEST.create,
		redirectToList: true,
		transformData: ({ id, location, address, city, postCode, countryCode, ...rest }) => ({
			...rest,
			id,
			address: address || null,
			city: city || null,
			postCode: postCode || null,
			countryCode: countryCode || null,
			coords:
				location != null
					? { latitude: location.coordinates[1], longitude: location.coordinates[0] }
					: null
		})
	})
};
