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

	const activity: ActivityDetail = await res.json();

	const form = await superValidate(
		{
			title: activity.title,
			location: activity.location,
			priceFrom: activity.price.from,
			currency: activity.price.currency,
			isFreeTour: Boolean(activity.isFreeTour)
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
				title: form.data.title,
				city: form.data.location,
				priceFrom: form.data.priceFrom,
				currency: form.data.currency,
				isFreeTour: form.data.isFreeTour ? 1 : 0
			})
		});

		if (!res.ok) {
			return fail(res.status, { form });
		}

		throw redirect(303, `/activities/${params.slug}`);
	}
};
