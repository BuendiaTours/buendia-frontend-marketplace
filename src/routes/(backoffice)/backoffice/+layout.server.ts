import type { LayoutServerLoad } from './$types';
import { getFlashMessage } from '$lib/server/backoffice/flashMessages';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const alert = getFlashMessage(cookies);

	return {
		alert
	};
};
