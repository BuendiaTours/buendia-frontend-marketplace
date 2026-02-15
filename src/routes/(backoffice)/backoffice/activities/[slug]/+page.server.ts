import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ACTIVITY_REQUEST } from '$core/activities/requests';
import { ApiError } from '$core/_shared/errors';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const activity = await ACTIVITY_REQUEST.findBySlug(fetch, params.slug);
		return { activity };
	} catch (err) {
		if (err instanceof ApiError) {
			if (err.type === 'not_found') {
				throw error(404, 'Actividad no encontrada');
			}
			throw error(err.status || 500, `Error API: ${err.status || 'desconocido'}`);
		}

		throw error(503, 'No se pudo conectar con el servidor');
	}
};
