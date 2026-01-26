import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { api, ApiError } from '$lib/api/index';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { destinationFormSchema } from '../../destination-form.schema';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const destinations = await api.destinations.getAll(fetch);
		const destination = destinations.find((d) => d.slug === params.slug);

		if (!destination) {
			throw error(404, 'Destino no encontrado');
		}

		const form = await superValidate(
			{
				id: destination.id,
				name: destination.name,
				slug: destination.slug,
				kind: destination.kind,
				descriptionShort: destination.descriptionShort,
				photoUrlHero: destination.photoUrlHero
			},
			zod(destinationFormSchema)
		);

		return { destination, form };
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
	default: async ({ request, fetch, params }) => {
		const form = await superValidate(request, zod(destinationFormSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			// Por ahora solo retornamos éxito, la actualización real se implementará cuando la API lo soporte
			console.log('Datos a actualizar:', form.data);

			// Simular éxito
			return { form, success: true };
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status || 500, {
					form,
					error: `Error al actualizar: ${err.message}`
				});
			}

			return fail(500, {
				form,
				error: 'Error al actualizar el destino'
			});
		}
	}
};
