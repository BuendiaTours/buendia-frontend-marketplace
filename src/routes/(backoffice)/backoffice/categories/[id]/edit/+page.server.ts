/**
 * Server load and actions for the category edit page.
 * Fetches the category by ID, populates the form, and wires up update/delete actions.
 */
import { CATEGORY_REQUEST } from '$core/categories/requests';
import { ApiError } from '$core/_shared/errors';
import { categoryFormSchema } from '../../schemas/category-form.schema';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { createUpdateAction } from '$lib/server/backoffice/updateAction';
import { createDeleteAction } from '$lib/server/backoffice/deleteAction';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const category = await CATEGORY_REQUEST.findById(fetch, params.id);

		const form = await superValidate(
			{
				id: category.id,
				name: category.name,
				status: category.status,
				description: category.description ?? ''
			},
			zod(categoryFormSchema)
		);

		return { category, form };
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status || 500);
		}
		throw error(503);
	}
};

export const actions: Actions = {
	update: createUpdateAction({
		basePath: `${BACKOFFICE_PREFIX}/categories`,
		schema: zod(categoryFormSchema),
		updateFn: CATEGORY_REQUEST.update,
		redirectToList: true,
		paramName: 'id',
		transformData: ({ id, ...rest }) => rest
	}),
	delete: createDeleteAction({
		basePath: `${BACKOFFICE_PREFIX}/categories`,
		deleteFn: CATEGORY_REQUEST.delete
	})
};
