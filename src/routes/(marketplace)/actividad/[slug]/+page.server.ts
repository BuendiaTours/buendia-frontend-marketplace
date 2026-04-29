import type { PageServerLoad } from './$types';
import { activitiesEndpoints } from '$lib/api/endpoints/activities';
import { reviewsEndpoints } from '$lib/api/endpoints/reviews';
import { activityOptionsEndpoints } from '$lib/api/endpoints/activityOptions';
import { handleApiError } from '$core/_shared/errors';
import { buildActivityBreadcrumbs } from '$lib/utils/breadcrumbs';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const { slug } = params;

	try {
		const activity = await activitiesEndpoints.getBySlug(fetch, slug);
		const [reviewsResult, reviewsStats, activityOptions, reviewAttachments] = await Promise.all([
			reviewsEndpoints.getByActivityId(fetch, activity.id),
			reviewsEndpoints.getStatsByActivityId(fetch, activity.id),
			activityOptionsEndpoints.getByActivityId(fetch, activity.id),
			reviewsEndpoints.getAttachmentsByActivityId(fetch, activity.id)
		]);

		return {
			activity,
			reviews: reviewsResult.data,
			reviewsTotalPages: reviewsResult.pagination.totalPages,
			reviewsTotal: reviewsResult.pagination.total,
			reviewsStats,
			activityOptions,
			reviewAttachments: reviewAttachments.data,
			breadcrumbs: buildActivityBreadcrumbs(activity)
		};
	} catch (err) {
		throw handleApiError(err, 'la actividad');
	}
};
