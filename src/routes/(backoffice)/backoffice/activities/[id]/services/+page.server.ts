/**
 * Server load for the services tab.
 * Includes meals and addons from the parent layout.
 * FREE_TOUR activities don't have services — we redirect them back to the edit page.
 */
import { redirect } from '@sveltejs/kit';
import { ActivityKind } from '$core/activities/enums';
import { ACTIVITY_ROUTES } from '$lib/config/routes/backoffice/activities';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, params }) => {
	const { activity, addons } = await parent();

	if (activity.kind === ActivityKind.FREE_TOUR) {
		throw redirect(303, ACTIVITY_ROUTES.edit(params.id));
	}

	return {
		meals: activity.meals ?? [],
		addons: addons ?? []
	};
};
