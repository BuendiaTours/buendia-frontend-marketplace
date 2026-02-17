import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { DESTINATION_REQUEST } from '$core/destinations/requests';
import { ApiError } from '$core/_shared/errors';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const destination = await DESTINATION_REQUEST.findBySlug(fetch, params.slug);
		return { destination };
	} catch (err) {
		if (err instanceof ApiError) {
			if (err.type === 'not_found') {
				throw error(404, 'Elemento no encontrado');
			}
			throw error(err.status || 500, `Error API: ${err.status || 'desconocido'}`);
		}

		throw error(503, 'No se pudo conectar con el servidor');
	}
};
