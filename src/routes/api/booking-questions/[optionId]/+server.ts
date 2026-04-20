import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { bookingQuestionsEndpoints } from '$lib/api/marketplace/endpoints/bookingQuestions';

export const GET: RequestHandler = async ({ params, fetch }) => {
	const result = await bookingQuestionsEndpoints.byActivityOption(fetch, params.optionId);
	return json(result);
};
