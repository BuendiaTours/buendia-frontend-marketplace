import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import type { Actions } from './$types';
import { createDeleteAction } from '$lib/server/deleteAction';
import { api } from '$lib/api/index';

export const actions: Actions = {
	default: createDeleteAction({
		basePath: `${BACKOFFICE_PREFIX}/attractions`,
		deleteFn: api.attractions.delete
	})
};
