import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { destinationsFiltersSchema } from './filters.schema';
import { api, ApiError } from '$lib/api/index';

export const load: PageServerLoad = async ({ fetch, url }) => {
	// Convertir URLSearchParams a objeto plano
	const paramsObject = Object.fromEntries(url.searchParams.entries());
	const filters = destinationsFiltersSchema.parse(paramsObject);

	try {
		// Por ahora usamos getAll sin filtros, en el futuro se implementará con paginación
		const destinations = await api.destinations.getAll(fetch);
		console.log('Destinations from API:', destinations);
		console.log('Destinations length:', destinations?.length);
		console.log('Filters:', filters);

		// Simulamos paginación local hasta que la API lo soporte
		const startIndex = (filters.page - 1) * filters.pageSize;
		const endIndex = startIndex + filters.pageSize;
		console.log('Pagination - page:', filters.page, 'pageSize:', filters.pageSize);
		console.log('Pagination - startIndex:', startIndex, 'endIndex:', endIndex);
		const paginatedItems = destinations.slice(startIndex, endIndex);
		console.log('Paginated items:', paginatedItems);

		return {
			items: paginatedItems,
			pagination: {
				page: filters.page,
				pageSize: filters.pageSize,
				total: destinations.length,
				totalPages: Math.ceil(destinations.length / filters.pageSize)
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
