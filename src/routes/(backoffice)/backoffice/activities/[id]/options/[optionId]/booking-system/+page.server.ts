/**
 * Server load for the option Booking System tab.
 * When the activity is indexed (Bokun), fetches rates, pricing categories,
 * and existing pricing category mappings.
 */
import { OptionIntegrationStatus, OptionBookingSystem } from '$core/activity-options/enums';
import { BOKUN_REQUEST } from '$core/bokun/requests';
import type { BokunActivity, BokunPricingCategoryMapping } from '$core/bokun/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, parent }) => {
	const { activity, option } = await parent();

	let bokunActivity: BokunActivity | null = null;
	let pricingCategoryMappings: BokunPricingCategoryMapping[] = [];

	const needsBokunData =
		option.bookingSystem === OptionBookingSystem.BOKUN &&
		(option.integrationStatus === OptionIntegrationStatus.ACTIVITY_INDEXED ||
			option.integrationStatus === OptionIntegrationStatus.COMPLETED);

	if (needsBokunData) {
		try {
			bokunActivity = await BOKUN_REQUEST.fetchActivity(fetch, activity.id);

			if (bokunActivity) {
				pricingCategoryMappings = await BOKUN_REQUEST.fetchPricingCategoryMappings(
					fetch,
					bokunActivity.id
				);
			}
		} catch {
			// Silently fail — page will show an error message
		}
	}

	return { activity, option, bokunActivity, pricingCategoryMappings };
};
