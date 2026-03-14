import { LOCATION_REQUEST } from '$core/locations/requests';
import { ApiError } from '$core/_shared/errors';
import { locationFormSchema } from '../../schemas/location-form.schema';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { createUpdateAction } from '$lib/server/backoffice/updateAction';
import { createDeleteAction } from '$lib/server/backoffice/deleteAction';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const location = await LOCATION_REQUEST.findById(fetch, params.id);

		const form = await superValidate(
			{
				id: location.id,
				parentId: location.parent?.id,
				name: location.name,
				kind: location.kind,
				descriptionShort: location.descriptionShort ?? ''
			},
			zod(locationFormSchema)
		);

		return {
			location,
			form,
			parentName: location.parent?.name ?? null
		};
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status || 500);
		}
		throw error(503);
	}
};

export const actions: Actions = {
	update: createUpdateAction({
		basePath: `${BACKOFFICE_PREFIX}/locations`,
		schema: zod(locationFormSchema),
		updateFn: LOCATION_REQUEST.update,
		redirectToList: true,
		paramName: 'id',
		transformData: ({ id, ...rest }) => rest
	}),
	delete: createDeleteAction({
		basePath: `${BACKOFFICE_PREFIX}/locations`,
		deleteFn: LOCATION_REQUEST.delete
	})
};
