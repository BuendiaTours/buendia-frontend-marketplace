import type { Actions } from './$types';
import { createDeleteAction } from '$lib/server/deleteAction';
import { api } from '$lib/api/index';

export const actions: Actions = {
	default: createDeleteAction({
		resourceName: 'destino',
		resourceNameWithArticle: 'el destino',
		basePath: '/destinations',
		deleteFn: api.destinations.delete
	})
};
