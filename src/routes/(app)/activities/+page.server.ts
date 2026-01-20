import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
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

	// Incluir ordenamiento si existe
	if (filters.sort) {
		apiUrl.searchParams.set('sort', filters.sort);
	}
	if (filters.order) {
		apiUrl.searchParams.set('order', filters.order);
	}

	// Incluir filtros booleanos solo si son true
	const booleanFilters = [
		'isFreeTour',
		'kidsFreeTour',
		'breakfastIncluded',
		'wheelchairAccessible',
		'audioGuideAvailable',
		'photographyAllowed',
		'smallGroup'
	] as const;

	booleanFilters.forEach((filterKey) => {
		if (filters[filterKey]) {
			apiUrl.searchParams.set(filterKey, '1');
		}
	});

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
			filters,
			sort: data.sort || null
		};
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		throw error(503, 'No se pudo conectar con el servidor. Verifica que la API esté funcionando.');
	}
};

export const actions: Actions = {
	delete: async ({ request, fetch }) => {
		// Obtener datos del formulario
		const formData = await request.formData();
		const slug = formData.get('slug');

		if (!slug || typeof slug !== 'string') {
			return fail(400, { error: 'Slug no válido' });
		}

		// Llamar a la API para eliminar
		const res = await fetch(`${PUBLIC_API_BASE_URL}/activities/${slug}`, {
			method: 'DELETE'
		});

		if (!res.ok) {
			return fail(res.status, {
				error: `Error al eliminar la actividad (${res.status})`
			});
		}

		// Redirigir al listado (sin filtros para simplificar)
		throw redirect(303, '/activities');
	}
};
