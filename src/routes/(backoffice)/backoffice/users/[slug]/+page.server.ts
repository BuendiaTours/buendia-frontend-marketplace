import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { USER_REQUEST } from '$core/users/requests';
import { ApiError } from '$core/_shared/errors';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const user = await USER_REQUEST.findById(fetch, params.slug);
		return { user };
	} catch (err) {
		if (err instanceof ApiError) {
			if (err.type === 'not_found') {
				throw error(404, 'Usuario no encontrado');
			}
			throw error(err.status || 500, `Error API: ${err.status || 'desconocido'}`);
		}

		throw error(503, 'No se pudo conectar con el servidor');
	}
};
