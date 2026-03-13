import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import type { Actions } from './$types';
import { createDeleteAction } from '$lib/server/backoffice/deleteAction';
import { LOCATION_REQUEST } from '$core/locations/requests';

export const actions: Actions = {
	default: createDeleteAction({
		basePath: `${BACKOFFICE_PREFIX}/locations`,
		deleteFn: LOCATION_REQUEST.delete
	})
};
