import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { LOCATION_REQUEST } from '$core/locations/requests';
import { ApiError } from '$core/_shared/errors';

export const load = (async ({ fetch, params }) => {
	try {
		const location = await LOCATION_REQUEST.findById(fetch, params.id);
		return { location };
	} catch (err) {
		if (err instanceof ApiError) {
			if (err.type === 'not_found') {
				throw error(404, 'Elemento no encontrado');
			}
			throw error(err.status || 500, `Error API: ${err.status || 'desconocido'}`);
		}

		throw error(503, 'No se pudo conectar con el servidor');
	}
}) satisfies PageServerLoad;
