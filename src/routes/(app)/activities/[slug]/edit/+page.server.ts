import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { api, ApiError } from '$lib/api/index';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { activityFormSchema } from '../../activity-form.schema';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const [activity, tagsResponse] = await Promise.all([
			api.activities.getBySlug(fetch, params.slug),
			fetch('http://localhost:3333/tags').then((res) => res.json())
		]);

		const apiData = activity as any;
		const firstOption = apiData.options?.[0];

		const form = await superValidate(
			{
				id: apiData.id || '',
				codeRef: apiData.codeRef || '',
				title: apiData.main?.title || '',
				slug: apiData.slug || '',
				descriptionShort: apiData.descriptionShort || '',
				descriptionFull: apiData.descriptionFull || '',
				location: apiData.location?.city || '',
				priceFrom: firstOption?.pricing?.defaultPricing?.from || 0,
				currency: firstOption?.pricing?.defaultPricing?.currency || 'EUR',
				isFreeTour: false,
				tags: apiData.tags || []
			},
			zod(activityFormSchema)
		);

		return { activity, form, availableTags: tagsResponse };
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
				tags: form.data.tags
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
