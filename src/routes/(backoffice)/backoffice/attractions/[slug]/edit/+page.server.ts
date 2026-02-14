import { attractionFormSchema } from '../../attraction-form.schema';
import { api, ApiError } from '$lib/api/index';
import { buildBreadcrumbs } from '$lib/utils/breadcrumbs';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { createUpdateAction } from '$lib/server/backoffice/updateAction';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ fetch, params, url }) => {
	try {
		const [attraction, destinationsResponse] = await Promise.all([
			api.attractions.getBySlug(fetch, params.slug),
			api.destinations.getAll(fetch)
		]);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- API response shape is not fully typed yet
		const apiData = attraction as Record<string, any>;

		const form = await superValidate(
			{
				id: apiData.id,
				name: apiData.name,
				slug: apiData.slug,
				status: apiData.status,
				description: apiData.description,
				descriptionLong: apiData.descriptionLong,
				photoUrl: apiData.photoUrl,
				photoUrlHero: apiData.photoUrlHero,
				postalAddress: apiData.postalAddress,
				destinations: apiData.destinations || [],
				location: apiData.location || null
			},
			zod(attractionFormSchema)
		);

		const breadcrumbs = buildBreadcrumbs(url.pathname, {
			label: apiData.name || 'Atracción'
		});

		return {
			attraction,
			form,
			availableDestinations: destinationsResponse.data || [],
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
		basePath: `${BACKOFFICE_PREFIX}/attractions`,
		schema: zod(attractionFormSchema),
		updateFn: api.attractions.update,
		redirectToEdit: true
	})
};
