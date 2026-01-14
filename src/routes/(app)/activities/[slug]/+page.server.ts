import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { PUBLIC_API_BASE_URL } from '$env/static/public';
import type { ActivityDetail } from '$lib/types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	const res = await fetch(`${PUBLIC_API_BASE_URL}/public/activities/${params.slug}`);

	if (res.status === 404) {
		throw error(404, 'Actividad no encontrada');
	}
	if (!res.ok) {
		throw error(res.status, `Error API: ${res.status}`);
	}

	const activity: ActivityDetail = await res.json();
	return { activity };
};
