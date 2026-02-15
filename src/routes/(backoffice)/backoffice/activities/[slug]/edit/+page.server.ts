import { activityFormSchema } from '../../activity-form.schema';
import { ACTIVITY_REQUEST } from '$core/activities/requests';
import { ATTRACTION_REQUEST } from '$core/attractions/requests';
import { CATEGORY_REQUEST } from '$core/categories/requests';
import { DESTINATION_REQUEST } from '$core/destinations/requests';
import { DISTRIBUTIVE_REQUEST } from '$core/distributives/requests';
import { TAG_REQUEST } from '$core/tags/requests';
import { ApiError } from '$core/_shared/errors';
import { buildBreadcrumbs } from '$lib/utils/breadcrumbs';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { createUpdateAction } from '$lib/server/backoffice/updateAction';
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
			ACTIVITY_REQUEST.findBySlug(fetch, params.slug),
			TAG_REQUEST.findByCriteria(fetch),
			CATEGORY_REQUEST.findByCriteria(fetch),
			ATTRACTION_REQUEST.findByCriteria(fetch),
			DESTINATION_REQUEST.findByCriteria(fetch),
			DISTRIBUTIVE_REQUEST.findByCriteria(fetch)
		]);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- API response shape is not fully typed yet
		const apiData = activity as Record<string, any>;
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
			availableTags: tagsResponse.data || [],
			availableCategories: categoriesResponse.data || [],
			availableAttractions: attractionsResponse.data || [],
			availableDestinations: destinationsResponse.data || [],
			availableDistributives: distributivesResponse.data || [],
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
		updateFn: ACTIVITY_REQUEST.update,
		redirectToEdit: true
	})
};
