import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { PUBLIC_API_BASE_URL } from '$env/static/public';

// Parámetros permitidos para pasar a la API desde la URL
import { ACTIVITIES_FILTER_PARAMS } from './filters';
import { forwardSearchParams } from '$lib/utils/url';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const page = Number(url.searchParams.get('page') ?? '1');
	const pageSize = Number(url.searchParams.get('pageSize') ?? '10');

	const apiUrl = new URL(`${PUBLIC_API_BASE_URL}/public/activities`);
	apiUrl.searchParams.set('page', String(page));
	apiUrl.searchParams.set('pageSize', String(pageSize));

	forwardSearchParams(url.searchParams, apiUrl.searchParams, ACTIVITIES_FILTER_PARAMS);

	try {
		const res = await fetch(apiUrl);

		if (!res.ok) {
			const errorMessage =
				res.status === 404
					? 'No se encontró el recurso solicitado'
					: res.status >= 500
						? 'El servidor no está disponible. Por favor, verifica que la API esté funcionando.'
						: `Error al cargar actividades (${res.status})`;

			throw error(res.status, errorMessage);
		}

		const data = await res.json();

		return {
			items: data.items,
			pagination: data.pagination
		};
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		throw error(503, 'No se pudo conectar con el servidor. Verifica que la API esté funcionando.');
	}
};
