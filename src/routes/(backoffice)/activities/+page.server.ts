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
			sort: filters.sort,
			order: filters.order,
			from: filters.from,
			to: filters.to,
			destination: filters.destination,
			isFreeTour: filters.isFreeTour,
			freeForKids: filters.kidsFreeTour,
			breakfast: filters.breakfastIncluded,
			wheelchairAccessible: filters.wheelchairAccessible
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
						: `Error al cargar actividades (${err.status || 'desconocido'})`;

			throw error(err.status || 500, errorMessage);
		}

		throw error(503, 'No se pudo conectar con el servidor. Verifica que la API esté funcionando.');
	}
};
