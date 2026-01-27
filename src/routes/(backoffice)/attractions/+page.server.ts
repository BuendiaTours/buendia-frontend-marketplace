import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { attractionsFiltersSchema } from './filters.schema';
import { api, ApiError } from '$lib/api/index';
import { parseFilters } from '$lib/utils/filters';

export const load: PageServerLoad = async ({ fetch, url }) => {
	// Parsear filtros desde URL usando el schema
	const filters = parseFilters(attractionsFiltersSchema, url.searchParams);

	try {
		const response = await api.attractions.getAll(fetch, {
			page: filters.page,
			pageSize: filters.pageSize,
			q: filters.q,
			status: filters.status,
			wheelchairAccessible: filters.wheelchairAccessible,
			breakfastIncluded: filters.breakfastIncluded,
			kidsFreeTour: filters.kidsFreeTour,
			sort: filters.sort,
			order: filters.order
		});

		// Si la API no devuelve pagination, calculamos localmente
		const items = response.data || [];
		const pagination = response.pagination || {
			page: filters.page,
			pageSize: filters.pageSize,
			total: items.length,
			totalPages: items.length > 0 ? Math.ceil(items.length / filters.pageSize) : 1
		};

		return {
			items,
			pagination,
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
