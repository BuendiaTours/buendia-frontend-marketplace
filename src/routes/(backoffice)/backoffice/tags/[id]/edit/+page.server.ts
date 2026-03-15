/**
 * Server load and actions for the tag edit page.
 * Fetches the tag by ID, populates the form, and wires up update/delete actions.
 */
import { TAG_REQUEST } from '$core/tags/requests';
import { ApiError } from '$core/_shared/errors';
import { tagFormSchema } from '../../schemas/tag-form.schema';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { createUpdateAction } from '$lib/server/backoffice/updateAction';
import { createDeleteAction } from '$lib/server/backoffice/deleteAction';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const tag = await TAG_REQUEST.findById(fetch, params.id);

		const form = await superValidate(
			{
				id: tag.id,
				name: tag.name
			},
			zod(tagFormSchema)
		);

		return { tag, form };
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status || 500);
		}
		throw error(503);
	}
};

export const actions: Actions = {
	update: createUpdateAction({
		basePath: `${BACKOFFICE_PREFIX}/tags`,
		schema: zod(tagFormSchema),
		updateFn: TAG_REQUEST.update,
		redirectToList: true,
		paramName: 'id',
		transformData: ({ id, ...rest }) => rest
	}),
	delete: createDeleteAction({
		basePath: `${BACKOFFICE_PREFIX}/tags`,
		deleteFn: TAG_REQUEST.delete
	})
};
