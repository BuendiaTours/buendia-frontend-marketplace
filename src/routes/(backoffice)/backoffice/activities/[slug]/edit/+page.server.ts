import { activityFormSchema } from '../../schemas/activity-form.schema';
import { ACTIVITY_REQUEST } from '$core/activities/requests';
import { ATTRACTION_REQUEST } from '$core/attractions/requests';
import { CATEGORY_REQUEST } from '$core/categories/requests';
import { LOCATION_REQUEST } from '$core/locations/requests';
import { DISTRIBUTIVE_REQUEST } from '$core/distributives/requests';
import { TAG_REQUEST } from '$core/tags/requests';
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
		const [
			activity,
			tagsResponse,
			categoriesResponse,
			attractionsResponse,
			locationsResponse,
			distributivesResponse
		] = await Promise.all([
			ACTIVITY_REQUEST.findBySlug(fetch, params.slug),
			TAG_REQUEST.findByCriteria(fetch),
			CATEGORY_REQUEST.findByCriteria(fetch),
			ATTRACTION_REQUEST.findByCriteria(fetch),
			LOCATION_REQUEST.findByCriteria(fetch),
			DISTRIBUTIVE_REQUEST.findByCriteria(fetch)
		]);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- API response shape is not fully typed yet
		const apiData = activity as Record<string, any>;

		const form = await superValidate(
			{
				id: apiData.id || '',
				title: apiData.title || '',
				slug: apiData.slug || '',
				codeRef: apiData.codeRef || '',
				descriptionFull: apiData.descriptionFull || '',
				descriptionShort: apiData.descriptionShort || '',
				infoImportant: apiData.infoImportant || '',
				phoneContact: apiData.phoneContact || '',
				tags: apiData.tags || [],
				categories: apiData.categories || [],
				attractions: apiData.attractions || [],
				destinations: apiData.destinations || [],
				distributives: apiData.distributives || [],
				stages: apiData.stages || [],
				meals: apiData.meals || [],
				excluded: apiData.excluded || [],
				included: apiData.included || [],
				itemsToBring: apiData.itemsToBring || [],
				notSuitableFor: apiData.notSuitableFor || [],
				kind: apiData.kind || '',
				guideKind: apiData.guideKind || '',
				status: apiData.status || 'DRAFT'
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
			availableLocations: locationsResponse.data || [],
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
