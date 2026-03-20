/**
 * Layout server load for activity option detail.
 * Gets activity from parent layout and fetches the option by ID.
 */
import { ACTIVITY_OPTION_REQUEST } from '$core/activity-options/requests';
import { ApiError } from '$core/_shared/errors';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch, params, parent }) => {
	try {
		const { activity } = await parent();
		const option = await ACTIVITY_OPTION_REQUEST.findById(fetch, params.optionId);
		return { activity, option };
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status || 500);
		}
		throw error(503);
	}
};
