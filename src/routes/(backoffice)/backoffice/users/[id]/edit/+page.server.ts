/**
 * Server load and actions for the user edit page.
 * Fetches the user by ID, populates the form, and wires up the update action.
 * Users are not deletable through the API.
 */
import { USER_REQUEST } from '$core/users/requests';
import { ApiError } from '$core/_shared/errors';
import { userFormSchema } from '../../schemas/user-form.schema';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { createUpdateAction } from '$lib/server/backoffice/updateAction';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const user = await USER_REQUEST.findById(fetch, params.id);

		const form = await superValidate(
			{
				id: user.id,
				name: user.name,
				email: user.email,
				phone: user.phone,
				status: user.status,
				roles: user.roles ?? []
			},
			zod(userFormSchema)
		);

		return { user, form };
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status || 500);
		}
		throw error(503);
	}
};

export const actions: Actions = {
	update: createUpdateAction({
		basePath: `${BACKOFFICE_PREFIX}/users`,
		schema: zod(userFormSchema),
		updateFn: USER_REQUEST.update,
		redirectToList: true,
		paramName: 'id',
		transformData: ({ id, ...rest }) => rest
	})
};
