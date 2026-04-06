import { redirect } from '@sveltejs/kit';
import { AUTH_REQUEST } from '$core/auth/requests';
import { clearAuthCookies } from '$lib/server/backoffice/auth';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	redirect(303, '/backoffice/login');
};

export const actions: Actions = {
	default: async ({ cookies, fetch }) => {
		try {
			await AUTH_REQUEST.logout(fetch);
		} catch {
			// Ignore errors — clear cookies regardless
		}

		clearAuthCookies(cookies);
		redirect(303, '/backoffice/login');
	}
};
