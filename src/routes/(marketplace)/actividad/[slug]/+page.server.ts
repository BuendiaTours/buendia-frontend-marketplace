import type { PageServerLoad } from './$types';
import { activitiesEndpoints } from '$lib/api/marketplace/endpoints/activities';
import { handleApiError } from '$core/_shared/errors';
import { buildActivityBreadcrumbs } from '$lib/utils/breadcrumbsMarketplace';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const { slug } = params;

	try {
		const activity = await activitiesEndpoints.getBySlug(fetch, slug);

		return {
			activity,
			breadcrumbs: buildActivityBreadcrumbs(activity)
		};
	} catch (err) {
		throw handleApiError(err, 'la actividad');
	}
};
