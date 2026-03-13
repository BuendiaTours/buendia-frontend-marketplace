import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { LOCATION_REQUEST } from '$core/locations/requests';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { createDeleteAction } from '$lib/server/backoffice/deleteAction';
import { ApiError } from '$core/_shared/errors';

export const load = (async ({ fetch, params }) => {
	try {
		const location = await LOCATION_REQUEST.findById(fetch, params.id);
		return { location };
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status || 500);
		}
		throw error(503);
	}
}) satisfies PageServerLoad;

export const actions: Actions = {
	delete: createDeleteAction({
		basePath: `${BACKOFFICE_PREFIX}/locations`,
		deleteFn: LOCATION_REQUEST.delete,
		paramName: 'id'
	})
};
