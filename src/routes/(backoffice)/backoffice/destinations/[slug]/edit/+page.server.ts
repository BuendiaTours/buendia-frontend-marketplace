import { api, ApiError } from '$lib/api/index';
import { buildBreadcrumbs } from '$lib/utils/breadcrumbs';
import { destinationFormSchema } from '../../destination-form.schema';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { createUpdateAction } from '$lib/server/updateAction';
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
	default: createUpdateAction({
		basePath: `${BACKOFFICE_PREFIX}/destinations`,
		schema: zod(destinationFormSchema),
		updateFn: api.destinations.update,
		redirectToEdit: true
	})
};
