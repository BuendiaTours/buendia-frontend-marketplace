import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ATTRACTION_REQUEST } from '$core/attractions/requests';
import { ApiError } from '$core/_shared/errors';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const attraction = await ATTRACTION_REQUEST.findById(fetch, params.id);
		return { attraction };
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status || 500);
		}
		throw error(503);
	}
};
