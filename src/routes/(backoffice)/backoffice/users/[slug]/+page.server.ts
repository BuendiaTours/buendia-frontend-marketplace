import type { PageServerLoad } from './$types';
import { USER_REQUEST } from '$core/users/requests';
import { handleApiError } from '$core/_shared/errors';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const user = await USER_REQUEST.findById(fetch, params.slug);
		return { user };
	} catch (err) {
		throw handleApiError(err, 'el usuario');
	}
};
