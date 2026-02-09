import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { api, ApiError } from '$lib/api/index';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const attraction = await api.attractions.getBySlug(fetch, params.slug);
		return { attraction };
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
