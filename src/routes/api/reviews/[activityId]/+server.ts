import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { reviewsEndpoints } from '$lib/api/marketplace/endpoints/reviews';
import type { ActivityReviewParams } from '$lib/types';

export const GET: RequestHandler = async ({ params, url, fetch }) => {
	const { activityId } = params;

	const reviewParams: ActivityReviewParams = {};

	const sort = url.searchParams.get('sort');
	if (sort === 'averageRating' || sort === 'createdAt') reviewParams.sort = sort;

	const order = url.searchParams.get('order');
	if (order === 'ASC' || order === 'DESC') reviewParams.order = order;

	const page = url.searchParams.get('page');
	if (page) reviewParams.page = Number(page);

	const pageSize = url.searchParams.get('pageSize');
	if (pageSize) reviewParams.pageSize = Number(pageSize);

	const stars = url.searchParams.getAll('stars').map(Number).filter(Boolean);
	if (stars.length > 0) reviewParams.stars = stars;

	const result = await reviewsEndpoints.getByActivityId(fetch, activityId, reviewParams);
	return json(result);
};
