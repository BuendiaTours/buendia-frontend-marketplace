import * as m from '$paraglide/messages';
import { USER_REQUEST } from '$core/users/requests';
import { handleApiError } from '$core/_shared/errors';
import { buildBreadcrumbs } from '$lib/utils/breadcrumbs';
import { userFormSchema } from '../../schemas/user-form.schema';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { createUpdateAction } from '$lib/server/backoffice/updateAction';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ fetch, params, url }) => {
	try {
		const user = await USER_REQUEST.findById(fetch, params.slug);

		const form = await superValidate(
			{
				id: user.id,
				name: user.name,
				email: user.email,
				phone: user.phone,
				kind: user.kind,
				status: user.status || undefined,
				roles: user.roles || undefined
			},
			zod(userFormSchema),
			{ errors: false }
		);

		const breadcrumbs = buildBreadcrumbs(url.pathname, {
			label: user.name || m.users_breadcrumbUser()
		});

		return {
			user,
			form,
			breadcrumbs
		};
	} catch (err) {
		throw handleApiError(err, 'el usuario');
	}
};

export const actions: Actions = {
	default: createUpdateAction({
		basePath: `${BACKOFFICE_PREFIX}/users`,
		schema: zod(userFormSchema),
		updateFn: USER_REQUEST.update,
		redirectToEdit: true,
		transformData: (formData) =>
			Object.fromEntries(Object.entries(formData).filter(([key]) => key !== 'id'))
	})
};
