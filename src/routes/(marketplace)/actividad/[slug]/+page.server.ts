import type { PageServerLoad } from './$types';
import { activitiesEndpoints } from '$lib/api/marketplace/endpoints/activities';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const { slug } = params;

	try {
		const activity = await activitiesEndpoints.getBySlug(fetch, slug);

		return {
			activity
		};
	} catch (err) {
		console.error(`Error loading activity ${slug}:`, err);
		throw error(404, 'Actividad no encontrada');
	}
};
