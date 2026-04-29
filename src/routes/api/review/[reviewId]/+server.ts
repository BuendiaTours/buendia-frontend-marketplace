import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { reviewsEndpoints } from '$lib/api/endpoints/reviews';

export const GET: RequestHandler = async ({ params, fetch }) => {
	const result = await reviewsEndpoints.getById(fetch, params.reviewId);
	return json(result);
};
