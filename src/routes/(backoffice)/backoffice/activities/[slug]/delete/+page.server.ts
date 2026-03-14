import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import type { Actions } from './$types';
import { createDeleteAction } from '$lib/server/backoffice/deleteAction';
import { ACTIVITY_REQUEST } from '$core/activities/requests';

export const actions: Actions = {
	default: createDeleteAction({
		basePath: `${BACKOFFICE_PREFIX}/activities`,
		deleteFn: ACTIVITY_REQUEST.delete,
		paramName: 'slug'
	})
};
