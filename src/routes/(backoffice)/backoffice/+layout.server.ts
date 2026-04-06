import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getFlashMessage } from '$lib/server/backoffice/flashMessages';
import { clearAuthCookies } from '$lib/server/backoffice/auth';
import { UserKind } from '$core/users/enums';

const PUBLIC_PATHS = ['/backoffice/login', '/backoffice/logout'];

export const load: LayoutServerLoad = async ({ cookies, locals, url }) => {
	const alert = getFlashMessage(cookies);
	const isPublicPath = PUBLIC_PATHS.some((p) => url.pathname.startsWith(p));

	if (!locals.user && !isPublicPath) {
		redirect(303, '/backoffice/login');
	}

	if (locals.user && locals.user.kind !== UserKind.ADMIN) {
		clearAuthCookies(cookies);
		redirect(303, '/backoffice/login');
	}

	return {
		alert,
		user: locals.user,
		accessToken: locals.accessToken
	};
};
