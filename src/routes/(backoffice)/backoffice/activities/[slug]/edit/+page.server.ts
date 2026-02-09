import { activityFormSchema } from '../../activity-form.schema';
import { api, ApiError } from '$lib/api/index';
import { apiConfig } from '$lib/api/config';
import { buildBreadcrumbs } from '$lib/utils/breadcrumbs';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { createUpdateAction } from '$lib/server/updateAction';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ fetch, params, url }) => {
	try {
		const [
			activity,
			tagsResponse,
			categoriesResponse,
			attractionsResponse,
			destinationsResponse,
			distributivesResponse
		] = await Promise.all([
			api.activities.getBySlug(fetch, params.slug),
			fetch(`${apiConfig.baseURL}/tags`).then((res) => res.json()),
			api.categories.getAll(fetch),
			api.attractions.getAll(fetch),
			api.destinations.getAll(fetch),
			api.distributives.getAll(fetch)
		]);

		const apiData = activity as any;
		const firstOption = apiData.options?.[0];

		const form = await superValidate(
			{
				attractions: apiData.attractions || [],
				categories: apiData.categories || [],
				codeRef: apiData.codeRef || '',
				currency: firstOption?.pricing?.defaultPricing?.currency || 'EUR',
				descriptionFull: apiData.descriptionFull || '',
				descriptionShort: apiData.descriptionShort || '',
				destinations: apiData.destinations || [],
				distributives: apiData.distributives || [],
				excluded: apiData.excluded || [],
				guideKind: apiData.guideKind || '',
				id: apiData.id || '',
				included: apiData.included || [],
				infoImportant: apiData.infoImportant || '',
				isFreeTour: false,
				kind: apiData.kind || '',
				location: apiData.location?.city || '',
				meals: apiData.meals || [],
				phoneContact: apiData.phoneContact || '',
				priceFrom: firstOption?.pricing?.defaultPricing?.from || 0,
				slug: apiData.slug || '',
				stages: apiData.stages || [],
				status: apiData.status || 'DRAFT',
				tags: apiData.tags || [],
				title: apiData.title || ''
			},
			zod(activityFormSchema)
		);

		const breadcrumbs = buildBreadcrumbs(url.pathname, {
			label: apiData.title || 'Actividad'
		});

		return {
			activity,
			form,
			availableTags: tagsResponse,
			availableCategories: categoriesResponse,
			availableAttractions: attractionsResponse.data || [],
			availableDestinations: destinationsResponse.data || [],
			availableDistributives: distributivesResponse || [],
			breadcrumbs
		};
	} catch (err) {
		if (err instanceof ApiError) {
			if (err.type === 'not_found') {
				throw error(404, 'Actividad no encontrada');
			}
			throw error(err.status || 500, `Error API: ${err.status || 'desconocido'}`);
		}

		throw error(503, 'No se pudo conectar con el servidor');
	}
};

export const actions: Actions = {
	default: createUpdateAction({
		basePath: `${BACKOFFICE_PREFIX}/activities`,
		schema: zod(activityFormSchema),
		updateFn: api.activities.update,
		redirectToEdit: true
	})
};
