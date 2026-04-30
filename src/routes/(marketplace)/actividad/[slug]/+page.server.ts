import type { PageServerLoad } from './$types';
import { activitiesEndpoints } from '$lib/api/endpoints/activities';
import { reviewsEndpoints } from '$lib/api/endpoints/reviews';
import { activityOptionsEndpoints } from '$lib/api/endpoints/activityOptions';
import { handleApiError } from '$core/_shared/errors';
import { buildActivityBreadcrumbs } from '$lib/utils/breadcrumbs';
import type { ActivityListItem, ActivityReviewStats } from '$lib/types';

function buildReviewsStats(
	activityId: string,
	totals: ActivityListItem['reviewsTotalByStars']
): ActivityReviewStats | null {
	if (!totals) return null;
	const { fiveStar, fourStar, threeStar, twoStar, oneStar } = totals;
	const total = fiveStar + fourStar + threeStar + twoStar + oneStar;
	if (total === 0) return null;
	const averageRating =
		(5 * fiveStar + 4 * fourStar + 3 * threeStar + 2 * twoStar + 1 * oneStar) / total;
	const distribution = [
		{ stars: 5, count: fiveStar, percentage: Math.round((fiveStar / total) * 100) },
		{ stars: 4, count: fourStar, percentage: Math.round((fourStar / total) * 100) },
		{ stars: 3, count: threeStar, percentage: Math.round((threeStar / total) * 100) },
		{ stars: 2, count: twoStar, percentage: Math.round((twoStar / total) * 100) },
		{ stars: 1, count: oneStar, percentage: Math.round((oneStar / total) * 100) }
	];
	return { activityId, total, averageRating, distribution };
}

export const load: PageServerLoad = async ({ params, fetch }) => {
	const { slug } = params;

	try {
		const activity = await activitiesEndpoints.getBySlug(fetch, slug);
		const [reviewsResult, activityOptions, reviewAttachments] = await Promise.all([
			reviewsEndpoints.getByActivityId(fetch, activity.id, { skip: 0, limit: 20 }),
			activityOptionsEndpoints.getByActivityId(fetch, activity.id),
			reviewsEndpoints.getAttachmentsByActivityId(fetch, activity.id)
		]);

		return {
			activity,
			reviews: reviewsResult.data,
			reviewsTotal: reviewsResult.total,
			reviewsStats: buildReviewsStats(activity.id, activity.reviewsTotalByStars),
			activityOptions,
			reviewAttachments: reviewAttachments.data,
			breadcrumbs: buildActivityBreadcrumbs(activity)
		};
	} catch (err) {
		throw handleApiError(err, 'la actividad');
	}
};
