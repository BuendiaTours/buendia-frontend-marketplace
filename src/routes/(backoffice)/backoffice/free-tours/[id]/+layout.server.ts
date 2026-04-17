/**
 * Layout server load for free tour sub-routes.
 * Fetches the full free tour by ID so child pages can access it via parent data.
 */
import { FREE_TOUR_REQUEST } from '$core/free-tours/requests';
import { ApiError } from '$core/_shared/errors';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch, params }) => {
	try {
		const freeTour = await FREE_TOUR_REQUEST.findById(fetch, params.id);
		return { freeTour };
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status || 500);
		}
		throw error(503);
	}
};
