import { attractionFormSchema } from '../../schemas/attraction-form.schema';
import { ATTRACTION_REQUEST } from '$core/attractions/requests';
import { LOCATION_REQUEST } from '$core/locations/requests';
import { ApiError } from '$core/_shared/errors';
import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { createUpdateAction } from '$lib/server/backoffice/updateAction';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ fetch, params, url }) => {
	try {
		const [attraction, locationsResponse] = await Promise.all([
			ATTRACTION_REQUEST.findBySlug(fetch, params.slug),
			LOCATION_REQUEST.findByCriteria(fetch)
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
			availableLocations: locationsResponse.data || [],
			breadcrumbs
		};
	} catch (err) {
		if (err instanceof ApiError) {
			if (err.type === 'not_found') {
				throw error(404, 'Atracción no encontrada');
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
		updateFn: ATTRACTION_REQUEST.update,
		redirectToEdit: true
	})
};
