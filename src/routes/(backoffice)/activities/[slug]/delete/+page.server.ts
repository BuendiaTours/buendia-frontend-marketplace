import type { Actions } from './$types';
import { createDeleteAction } from '$lib/server/deleteAction';
import { api } from '$lib/api/index';

export const actions: Actions = {
	default: createDeleteAction({
		resourceName: 'actividad',
		resourceNameWithArticle: 'la actividad',
		basePath: '/activities',
		deleteFn: api.activities.delete
	})
};
