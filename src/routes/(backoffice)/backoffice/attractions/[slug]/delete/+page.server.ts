import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import type { Actions } from './$types';
import { createDeleteAction } from '$lib/server/backoffice/deleteAction';
import { ATTRACTION_REQUEST } from '$core/attractions/requests';

export const actions: Actions = {
	default: createDeleteAction({
		basePath: `${BACKOFFICE_PREFIX}/attractions`,
		deleteFn: ATTRACTION_REQUEST.delete
	})
};
