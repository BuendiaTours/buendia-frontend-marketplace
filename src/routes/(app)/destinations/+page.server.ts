import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { destinationsFiltersSchema } from './filters.schema';
import { api, ApiError } from '$lib/api/index';
import { parseFilters } from '$lib/utils/filters';

export const load: PageServerLoad = async ({ fetch, url }) => {
	// Parsear filtros desde URL usando el schema
	const filters = parseFilters(destinationsFiltersSchema, url.searchParams);

	try {
		// Por ahora usamos getAll sin filtros, en el futuro se implementará con paginación
		const destinations = await api.destinations.getAll(fetch);

		// Validar que destinations sea un array válido
		const validDestinations = Array.isArray(destinations) ? destinations : [];
		const total = validDestinations.length;

		// Simulamos paginación local hasta que la API lo soporte
		const startIndex = (filters.page - 1) * filters.pageSize;
		const endIndex = startIndex + filters.pageSize;
		const paginatedItems = validDestinations.slice(startIndex, endIndex);

		return {
			items: paginatedItems,
			pagination: {
				page: filters.page,
				pageSize: filters.pageSize,
				total,
				totalPages: total > 0 ? Math.ceil(total / filters.pageSize) : 1
			},
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
						: `Error al cargar destinos (${err.status || 'desconocido'})`;

			throw error(err.status || 500, errorMessage);
		}

		throw error(503, 'No se pudo conectar con el servidor. Verifica que la API esté funcionando.');
	}
};
