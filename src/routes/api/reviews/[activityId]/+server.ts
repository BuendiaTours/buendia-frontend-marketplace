import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { reviewsEndpoints } from '$lib/api/endpoints/reviews';
import type { ActivityReviewParams } from '$lib/types';

export const GET: RequestHandler = async ({ params, url, fetch }) => {
	const { activityId } = params;

	const reviewParams: ActivityReviewParams = {};

	const sort = url.searchParams.get('sort');
	if (sort === 'averageRating' || sort === 'createdAt') reviewParams.sort = sort;

	const order = url.searchParams.get('order');
	if (order === 'ASC' || order === 'DESC') reviewParams.order = order;

	const skip = url.searchParams.get('skip');
	if (skip !== null) reviewParams.skip = Number(skip);

	const limit = url.searchParams.get('limit');
	if (limit) reviewParams.limit = Number(limit);

	const averageRatings = url.searchParams.getAll('averageRatings').map(Number).filter(Boolean);
	if (averageRatings.length > 0) reviewParams.averageRatings = averageRatings;

	const result = await reviewsEndpoints.getByActivityId(fetch, activityId, reviewParams);
	return json(result);
};
