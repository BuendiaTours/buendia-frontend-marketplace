/**
 * Layout server load for free tour sub-routes.
 * Fetches the full free tour by ID plus its publish readiness so child pages
 * can access them via parent data.
 */
import { FREE_TOUR_REQUEST } from '$core/free-tours/requests';
import type { FreeTourPublishReadiness } from '$core/free-tours/types';
import { ApiError } from '$core/_shared/errors';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

const EMPTY_READINESS: FreeTourPublishReadiness = { ready: false, missing: [] };

export const load: LayoutServerLoad = async ({ fetch, params }) => {
	try {
		const [freeTour, publishReadiness] = await Promise.all([
			FREE_TOUR_REQUEST.findById(fetch, params.id),
			FREE_TOUR_REQUEST.checkPublishReadiness(fetch, params.id).catch(() => EMPTY_READINESS)
		]);
		return { freeTour, publishReadiness };
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status || 500);
		}
		throw error(503);
	}
};
