import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import type { Actions } from './$types';
import { createDeleteAction } from '$lib/server/backoffice/deleteAction';
import { DESTINATION_REQUEST } from '$core/destinations/requests';

export const actions: Actions = {
	default: createDeleteAction({
		basePath: `${BACKOFFICE_PREFIX}/destinations`,
		deleteFn: DESTINATION_REQUEST.delete
	})
};
