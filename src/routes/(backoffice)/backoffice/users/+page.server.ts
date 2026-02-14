import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { usersFiltersSchema } from './filters.schema';
import { api, ApiError } from '$lib/api/index';
import { buildPagination } from '$core/_shared/params';

import { parseFilters } from '$lib/utils/filters';
import { generateBreadcrumbs } from '$lib/utils/breadcrumbs';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const filters = parseFilters(usersFiltersSchema, url.searchParams);

	try {
		const breadcrumbs = generateBreadcrumbs(url.pathname);

		const response = await api.users.findByCriteria(fetch, {
			page: filters.page,
			pageSize: filters.pageSize,
			sort: filters.sort,
			order: filters.order,
			q: filters.q,
			email: filters.email,
			phone: filters.phone,
			kind: filters.kind,
			status: filters.status
		});

		return {
			items: response.data || [],
			pagination: buildPagination(response.total, filters.page, filters.pageSize),
			filters,
			sort: filters.sort && filters.order ? { field: filters.sort, order: filters.order } : null,
			breadcrumbs
		};
	} catch (err) {
		if (err instanceof ApiError) {
			const errorMessage =
				err.type === 'not_found'
					? 'No se encontró el recurso solicitado'
					: err.type === 'server_error'
						? 'El servidor no está disponible. Por favor, verifica que la API esté funcionando.'
						: `Error al cargar usuarios (${err.status || 'desconocido'})`;

			throw error(err.status || 500, errorMessage);
		}

		throw error(503, 'No se pudo conectar con el servidor. Verifica que la API esté funcionando.');
	}
};
