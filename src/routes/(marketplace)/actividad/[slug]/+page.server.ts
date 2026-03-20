import type { PageServerLoad } from './$types';
import { activitiesEndpoints } from '$lib/api/marketplace/endpoints/activities';
import { reviewsEndpoints } from '$lib/api/marketplace/endpoints/reviews';
import { handleApiError } from '$core/_shared/errors';
import { buildActivityBreadcrumbs } from '$lib/utils/breadcrumbsMarketplace';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const { slug } = params;

	try {
		const activity = await activitiesEndpoints.getBySlug(fetch, slug);
		const [reviewsResult, reviewsStats] = await Promise.all([
			reviewsEndpoints.getByActivityId(fetch, activity.id),
			reviewsEndpoints.getStatsByActivityId(fetch, activity.id)
		]);

		return {
			activity,
			reviews: reviewsResult.data,
			reviewsTotalPages: reviewsResult.pagination.totalPages,
			reviewsTotal: reviewsResult.pagination.total,
			reviewsStats,
			breadcrumbs: buildActivityBreadcrumbs(activity)
		};
	} catch (err) {
		throw handleApiError(err, 'la actividad');
	}
};
