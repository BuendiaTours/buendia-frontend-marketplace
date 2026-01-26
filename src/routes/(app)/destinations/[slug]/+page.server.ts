import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { api, ApiError } from '$lib/api/index';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		// La API no soporta búsqueda directa por slug, obtenemos todos y filtramos
		const destinations = await api.destinations.getAll(fetch);
		const destination = destinations.find((d) => d.slug === params.slug);

		if (!destination) {
			throw error(404, 'Destino no encontrado');
		}

		return { destination };
	} catch (err) {
		// Si el error ya es un error de SvelteKit (404), lo re-lanzamos
		if (err && typeof err === 'object' && 'status' in err && err.status === 404) {
			throw err;
		}

		if (err instanceof ApiError) {
			if (err.type === 'not_found') {
				throw error(404, 'Destino no encontrado');
			}
			throw error(err.status || 500, `Error API: ${err.status || 'desconocido'}`);
		}

		throw error(503, 'No se pudo conectar con el servidor');
	}
};
