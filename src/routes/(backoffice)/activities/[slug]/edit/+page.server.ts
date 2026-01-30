import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { api, ApiError } from '$lib/api/index';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { activityFormSchema } from '../../activity-form.schema';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const [
			activity,
			tagsResponse,
			categoriesResponse,
			attractionsResponse,
			destinationsResponse,
			distributivesResponse,
			statusResponse,
			kindsResponse,
			guideKindsResponse
		] = await Promise.all([
			api.activities.getBySlug(fetch, params.slug),
			fetch('http://localhost:3333/tags').then((res) => res.json()),
			api.categories.getAll(fetch),
			api.attractions.getAll(fetch),
			api.destinations.getAll(fetch),
			api.distributives.getAll(fetch),
			api.activities.getStatuses(fetch),
			api.activities.getKinds(fetch),
			api.activities.getGuideKinds(fetch)
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
				id: apiData.id || '',
				infoImportant: apiData.infoImportant || '',
				isFreeTour: false,
				location: apiData.location?.city || '',
				priceFrom: firstOption?.pricing?.defaultPricing?.from || 0,
				slug: apiData.slug || '',
				tags: apiData.tags || [],
				title: apiData.title || '',
				excluded: apiData.excluded || [],
				included: apiData.included || [],
				destinations: apiData.destinations || [],
				distributives: apiData.distributives || [],
				stages: apiData.stages || [],
				status: apiData.status || 'DRAFT',
				kind: apiData.kind || '',
				guideKind: apiData.guideKind || '',
				phoneContact: apiData.phoneContact || ''
			},
			zod(activityFormSchema)
		);

		return {
			activity,
			form,
			availableTags: tagsResponse,
			availableCategories: categoriesResponse,
			availableAttractions: attractionsResponse.data || [],
			availableDestinations: destinationsResponse.data || [],
			availableDistributives: distributivesResponse || [],
			availableStatuses: statusResponse || [],
			availableKinds: kindsResponse || [],
			availableGuideKinds: guideKindsResponse || []
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
	default: async ({ request, params, fetch }) => {
		const form = await superValidate(request, zod(activityFormSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await api.activities.update(fetch, params.slug, {
				id: form.data.id,
				codeRef: form.data.codeRef,
				title: form.data.title,
				slug: form.data.slug,
				descriptionShort: form.data.descriptionShort,
				descriptionFull: form.data.descriptionFull,
				tags: form.data.tags,
				categories: form.data.categories,
				excluded: form.data.excluded,
				included: form.data.included,
				destinations: form.data.destinations,
				distributives: form.data.distributives,
				status: form.data.status,
				phoneContact: form.data.phoneContact,
				infoImportant: form.data.infoImportant,
				location: form.data.location,
				priceFrom: form.data.priceFrom,
				currency: form.data.currency,
				isFreeTour: form.data.isFreeTour,
				attractions: form.data.attractions
			} as any);

			throw redirect(303, `/activities/${params.slug}`);
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status || 500, { form });
			}

			if (err && typeof err === 'object' && 'status' in err && err.status === 303) {
				throw err;
			}

			return fail(503, { form });
		}
	}
};
