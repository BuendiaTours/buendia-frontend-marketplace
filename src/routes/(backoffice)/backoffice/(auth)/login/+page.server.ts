import { fail, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import * as m from '$paraglide/messages';
import { AUTH_REQUEST } from '$core/auth/requests';
import { AuthProviderKind } from '$core/auth/enums';
import { UserKind } from '$core/users/enums';
import type { UserRole } from '$core/users/enums';
import { ApiError } from '$core/_shared/errors';
import { setAuthCookies, setUserInfoCookie } from '$lib/server/backoffice/auth';
import { loginFormSchema } from './schemas/login-form.schema';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(303, '/backoffice');
	}

	const form = await superValidate(zod(loginFormSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, cookies, fetch }) => {
		const form = await superValidate(request, zod(loginFormSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const response = await AUTH_REQUEST.login(fetch, {
				provider: AuthProviderKind.COGNITO,
				email: form.data.email,
				password: form.data.password
			});

			if (response.user.kind !== UserKind.ADMIN) {
				return message(form, m.auth_notAdmin(), { status: 403 });
			}

			setAuthCookies(cookies, response);
			setUserInfoCookie(cookies, {
				id: response.user.id,
				email: response.user.email,
				name: response.user.name,
				kind: response.user.kind as UserKind,
				roles: response.user.roles as UserRole[]
			});
		} catch (err) {
			if (err instanceof ApiError) {
				if (err.status === 401) {
					return message(form, m.auth_invalidCredentials(), { status: 401 });
				}
				if (err.status === 429) {
					return message(form, m.auth_tooManyAttempts(), { status: 429 });
				}
			}
			return message(form, m.auth_loginError(), { status: 500 });
		}

		redirect(303, '/backoffice');
	}
};
