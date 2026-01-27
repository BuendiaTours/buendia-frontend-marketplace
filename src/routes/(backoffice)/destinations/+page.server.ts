import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { destinationsFiltersSchema } from './filters.schema';
import { api, ApiError } from '$lib/api/index';
import { parseFilters } from '$lib/utils/filters';

export const load: PageServerLoad = async ({ fetch, url }) => {
	// Parsear filtros desde URL usando el schema
	const filters = parseFilters(destinationsFiltersSchema, url.searchParams);

	try {
		const response = await api.destinations.getAll(fetch, {
			page: filters.page,
			pageSize: filters.pageSize,
			sort: filters.sort,
			order: filters.order,
			q: filters.q,
			kind: filters.kind,
			wheelchairAccessible: filters.wheelchairAccessible,
			breakfastIncluded: filters.breakfastIncluded,
			kidsFreeTour: filters.kidsFreeTour
		});

		return {
			items: response.data || [],
			pagination: response.pagination || null,
			filters,
			sort: filters.sort && filters.order ? { field: filters.sort, order: filters.order } : null
		};
	} catch (err) {
		if (err instanceof ApiError) {
			const errorMessage =
				err.type === 'not_found'
					? 'No se encontró el recurso solicitado'
					: err.type === 'server_error'
						? 'El servidor no está disponible. Por favor, verifica que la API esté funcionando.'
						: `Error al cargar elementos (${err.status || 'desconocido'})`;

			throw error(err.status || 500, errorMessage);
		}

		throw error(503, 'No se pudo conectar con el servidor. Verifica que la API esté funcionando.');
	}
};
