/**
 * Server load and action for the user creation page.
 * All users created from backoffice are ADMIN kind.
 * The action creates the user record AND registers the Cognito auth identity.
 * Because the caller is an ADMIN, the backend auto-confirms the Cognito account.
 */
import { redirect, fail, isRedirect } from '@sveltejs/kit';
import { v4 as uuidv4 } from 'uuid';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { createCreateLoad } from '$lib/server/backoffice/createLoad';
import { userFormSchema, type UserFormSchema } from '../schemas/user-form.schema';
import { USER_REQUEST } from '$core/users/requests';
import { AUTH_REQUEST } from '$core/auth/requests';
import { AuthProviderKind } from '$core/auth/enums';
import { UserKind } from '$core/users/enums';
import { ApiError } from '$core/_shared/errors';
import { setFlashMessage } from '$lib/server/backoffice/flashMessages';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { logger } from '$lib/utils/logger';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = createCreateLoad<UserFormSchema>({
	schema: zod(userFormSchema),
	initialValues: {
		name: '',
		email: '',
		phone: '',
		roles: []
	}
});

/** Generates a default password: initials (uppercase) from each word in name + "!Pass.07". */
function generateDefaultPassword(name: string): string {
	const initials = name
		.split(/\s+/)
		.map((word) => word.charAt(0).toUpperCase())
		.join('');
	return `${initials}!Pass.07`;
}

export const actions: Actions = {
	default: async ({ request, fetch, cookies }) => {
		const form = await superValidate(request, zod(userFormSchema));

		if (!form.valid) {
			setFlashMessage(cookies, {
				type: 'error',
				message: 'Por favor, corrige los errores del formulario.',
				code: 'error.validation'
			});
			return fail(400, { form });
		}

		const { id, status, ...rest } = form.data;
		const authIdentityId = uuidv4();
		const password = generateDefaultPassword(rest.name);

		try {
			// 1. Create user record
			await USER_REQUEST.create(fetch, { id, kind: UserKind.ADMIN, ...rest });

			// 2. Register Cognito identity (JWT auto-injected by handleFetch → admin auto-confirms)
			await AUTH_REQUEST.register(fetch, {
				authIdentityId,
				userId: id,
				provider: AuthProviderKind.COGNITO,
				email: rest.email,
				password,
				name: rest.name,
				phone: rest.phone,
				kind: UserKind.ADMIN
			});

			logger.log('✅ [users/create] User + auth identity created successfully');

			setFlashMessage(cookies, {
				type: 'success',
				message: 'Usuario creado correctamente.',
				code: 'create.success'
			});

			await new Promise((resolve) => setTimeout(resolve, 500));
			throw redirect(303, `${BACKOFFICE_PREFIX}/users`);
		} catch (err) {
			if (isRedirect(err)) throw err;

			logger.log('❌ [users/create] Error:', err);

			const message =
				err instanceof ApiError && err.status === 409
					? 'Ya existe un usuario con este email.'
					: 'Error al crear el usuario.';

			setFlashMessage(cookies, { type: 'error', message, code: 'error.create' });
			return fail(err instanceof ApiError ? err.status || 500 : 500, { form });
		}
	}
};
