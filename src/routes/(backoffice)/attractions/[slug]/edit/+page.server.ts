import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { api, ApiError } from '$lib/api/index';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { attractionFormSchema } from '../../attraction-form.schema';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const [attraction, destinationsResponse, statusResponse] = await Promise.all([
			api.attractions.getBySlug(fetch, params.slug),
			api.destinations.getAll(fetch),
			api.attractions.getStatuses(fetch)
		]);

		const form = await superValidate(
			{
				id: attraction.id,
				name: attraction.name,
				slug: attraction.slug,
				status: attraction.status,
				description: attraction.description,
				descriptionLong: attraction.descriptionLong,
				photoUrl: attraction.photoUrl,
				photoUrlHero: attraction.photoUrlHero
			},
			zod(attractionFormSchema)
		);

		return {
			attraction,
			form,
			availableDestinations: destinationsResponse.data || [],
			availableStatuses: statusResponse || []
		};
	} catch (err) {
		if (err instanceof ApiError) {
			if (err.type === 'not_found') {
				throw error(404, 'Destino no encontrado');
			}
			throw error(err.status || 500, `Error API: ${err.status || 'desconocido'}`);
		}

		throw error(503, 'No se pudo conectar con el servidor');
	}
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const form = await superValidate(request, zod(attractionFormSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			// TODO: Implementar cuando la API tenga el endpoint de actualización
			// await api.attractions.update(fetch, params.slug, form.data);

			console.log('Datos a actualizar:', form.data);

			// Por ahora redirigimos sin actualizar
			throw redirect(303, `/attractions/${params.slug}`);
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status || 500, { form });
			}

			// Si el error es un redirect (303), lo re-lanzamos
			if (err && typeof err === 'object' && 'status' in err && err.status === 303) {
				throw err;
			}

			return fail(503, { form });
		}
	}
};
