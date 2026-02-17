import type { PageServerLoad } from './$types';
import { activitiesEndpoints } from '$lib/api/marketplace/endpoints/activities';
import { handleApiError } from '$core/_shared/errors';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const { slug } = params;

	try {
		const activity = await activitiesEndpoints.getBySlug(fetch, slug);

		return {
			activity
		};
	} catch (err) {
		throw handleApiError(err, 'la actividad');
	}
};
