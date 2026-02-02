import { api, ApiError } from '$lib/api/index';
import { buildBreadcrumbs } from '$lib/utils/breadcrumbs';
import { destinationFormSchema } from '../../destination-form.schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ fetch, params, url }) => {
	try {
		const destination = await api.destinations.getBySlug(fetch, params.slug);

		const apiData = destination as any;

		const form = await superValidate(
			{
				id: apiData.id,
				name: apiData.name,
				slug: apiData.slug,
				kind: apiData.kind,
				descriptionShort: apiData.descriptionShort,
				photoUrlHero: apiData.photoUrlHero
			},
			zod(destinationFormSchema)
		);

		const breadcrumbs = buildBreadcrumbs(url.pathname, {
			label: apiData.name || 'Destino'
		});

		return {
			destination,
			form,
			breadcrumbs
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
		const form = await superValidate(request, zod(destinationFormSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			// TODO: Implementar cuando la API tenga el endpoint de actualización
			// await api.destinations.update(fetch, params.slug, form.data);

			console.log('Datos a actualizar:', form.data);

			// Por ahora redirigimos sin actualizar
			throw redirect(303, `/destinations/${params.slug}`);
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
