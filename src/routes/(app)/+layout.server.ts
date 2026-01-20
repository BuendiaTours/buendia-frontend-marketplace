import type { LayoutServerLoad } from './$types';
import { getFlashMessage } from '$lib/server/flashMessages';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const alert = getFlashMessage(cookies);

	return {
		alert
	};
};
