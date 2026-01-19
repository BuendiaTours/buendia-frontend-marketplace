import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { parseFilters } from '$lib/utils/filters';
import { activitiesFiltersSchema } from './filters.schema';

export const load: PageServerLoad = async ({ fetch, url }) => {
	// Parsear filtros desde URL usando el schema
	const filters = parseFilters(activitiesFiltersSchema, url.searchParams);

	// Construir URL a API externa
	const apiUrl = new URL(`${PUBLIC_API_BASE_URL}/activities`);

	// Siempre incluir page y pageSize
	apiUrl.searchParams.set('page', String(filters.page));
	apiUrl.searchParams.set('pageSize', String(filters.pageSize));

	// Incluir from y to solo si ambos existen
	if (filters.from && filters.to) {
		apiUrl.searchParams.set('from', filters.from);
		apiUrl.searchParams.set('to', filters.to);
	}

	// Incluir location si existe
	if (filters.location) {
		apiUrl.searchParams.set('location', filters.location);
	}

	// Incluir filtros booleanos solo si son true
	if (filters.isFreeTour) {
		apiUrl.searchParams.set('isFreeTour', '1');
	}
	if (filters.kidsFreeTour) {
		apiUrl.searchParams.set('kidsFreeTour', '1');
	}
	if (filters.breakfastIncluded) {
		apiUrl.searchParams.set('breakfastIncluded', '1');
	}
	if (filters.wheelchairAccessible) {
		apiUrl.searchParams.set('wheelchairAccessible', '1');
	}
	if (filters.audioGuideAvailable) {
		apiUrl.searchParams.set('audioGuideAvailable', '1');
	}
	if (filters.photographyAllowed) {
		apiUrl.searchParams.set('photographyAllowed', '1');
	}
	if (filters.smallGroup) {
		apiUrl.searchParams.set('smallGroup', '1');
	}

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
			pagination: data.pagination,
			filters
		};
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		throw error(503, 'No se pudo conectar con el servidor. Verifica que la API esté funcionando.');
	}
};
