import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { parseFilters } from '$lib/utils/filters';
import { activitiesFiltersSchema } from './filters.schema';
import { api, ApiError } from '$lib/api/index';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const filters = parseFilters(activitiesFiltersSchema, url.searchParams);

	try {
		const response = await api.activities.getAll(fetch, {
			page: filters.page,
			pageSize: filters.pageSize,
			from: filters.from,
			to: filters.to,
			destination: filters.destination,
			isFreeTour: filters.isFreeTour,
			freeForKids: filters.kidsFreeTour,
			breakfast: filters.breakfastIncluded,
			wheelchairAccessible: filters.wheelchairAccessible,
			sortBy: filters.sort,
			sortOrder: filters.order
		});

		return {
			items: response.items || [],
			pagination: response.pagination,
			filters,
			sort: null
		};
	} catch (err) {
		if (err instanceof ApiError) {
			const errorMessage =
				err.type === 'not_found'
					? 'No se encontró el recurso solicitado'
					: err.type === 'server_error'
						? 'El servidor no está disponible. Por favor, verifica que la API esté funcionando.'
						: `Error al cargar actividades (${err.status || 'desconocido'})`;

			throw error(err.status || 500, errorMessage);
		}

		throw error(503, 'No se pudo conectar con el servidor. Verifica que la API esté funcionando.');
	}
};
