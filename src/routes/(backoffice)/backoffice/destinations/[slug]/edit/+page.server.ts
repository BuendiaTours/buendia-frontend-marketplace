import { DESTINATION_REQUEST } from '$core/destinations/requests';
import { ApiError } from '$core/_shared/errors';
import { buildBreadcrumbs } from '$lib/utils/breadcrumbs';
import { destinationFormSchema } from '../../schemas/destination-form.schema';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { createUpdateAction } from '$lib/server/backoffice/updateAction';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ fetch, params, url }) => {
	try {
		const destination = await DESTINATION_REQUEST.findBySlug(fetch, params.slug);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- API response shape is not fully typed yet
		const apiData = destination as Record<string, any>;

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
		updateFn: DESTINATION_REQUEST.update,
		redirectToEdit: true
	})
};
