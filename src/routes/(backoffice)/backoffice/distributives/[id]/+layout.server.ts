/**
 * Layout server load for distributive sub-routes.
 * Fetches the full distributive by ID so child pages can access it via parent data.
 */
import { DISTRIBUTIVE_REQUEST } from '$core/distributives/requests';
import { ApiError } from '$core/_shared/errors';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch, params }) => {
	try {
		const distributive = await DISTRIBUTIVE_REQUEST.findById(fetch, params.id);
		return { distributive };
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status || 500);
		}
		throw error(503);
	}
};
