import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { PUBLIC_API_BASE_URL } from '$env/static/public';
import type { ActivityDetail } from '$lib/types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { activityFormSchema } from '../../activity-form.schema';

export const load: PageServerLoad = async ({ fetch, params }) => {
	const res = await fetch(`${PUBLIC_API_BASE_URL}/activities/${params.slug}`);

	if (res.status === 404) {
		throw error(404, 'Actividad no encontrada');
	}
	if (!res.ok) {
		throw error(res.status, `Error API: ${res.status}`);
	}

	const response = await res.json();
	const activity: ActivityDetail = response.data || response;

	// Mapear desde la estructura real de la API
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

	return { activity, form };
};

export const actions: Actions = {
	default: async ({ request, params, fetch }) => {
		const form = await superValidate(request, zod(activityFormSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const res = await fetch(`${PUBLIC_API_BASE_URL}/activities/${params.slug}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				id: form.data.id,
				codeRef: form.data.codeRef,
				title: form.data.title,
				slug: form.data.slug,
				descriptionShort: form.data.descriptionShort,
				descriptionFull: form.data.descriptionFull,
				city: form.data.location,
				priceFrom: form.data.priceFrom,
				currency: form.data.currency,
				isFreeTour: form.data.isFreeTour ? 1 : 0,
				tags: form.data.tags
			})
		});

		if (!res.ok) {
			return fail(res.status, { form });
		}

		throw redirect(303, `/activities/${params.slug}`);
	}
};
