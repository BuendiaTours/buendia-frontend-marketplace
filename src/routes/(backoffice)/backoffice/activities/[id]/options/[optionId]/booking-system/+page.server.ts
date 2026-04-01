/**
 * Server load for the option Booking System tab.
 * When the activity is indexed, fetches booking system data (Bokun or TuriTop).
 */
import { OptionIntegrationStatus, OptionBookingSystem } from '$core/activity-options/enums';
import { BOKUN_REQUEST } from '$core/bokun/requests';
import { TURITOP_REQUEST } from '$core/turitop/requests';
import type { BokunActivity, BokunPricingCategoryMapping } from '$core/bokun/types';
import type { TuritopProduct } from '$core/turitop/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, parent }) => {
	const { activity, option } = await parent();

	let bokunActivity: BokunActivity | null = null;
	let pricingCategoryMappings: BokunPricingCategoryMapping[] = [];
	let turitopProduct: TuritopProduct | null = null;

	const isIndexedOrCompleted =
		option.integrationStatus === OptionIntegrationStatus.ACTIVITY_INDEXED ||
		option.integrationStatus === OptionIntegrationStatus.COMPLETED;

	if (option.bookingSystem === OptionBookingSystem.BOKUN && isIndexedOrCompleted) {
		try {
			bokunActivity = await BOKUN_REQUEST.fetchActivity(fetch, activity.id);
			if (bokunActivity) {
				pricingCategoryMappings = await BOKUN_REQUEST.fetchPricingCategoryMappings(
					fetch,
					bokunActivity.id
				);
			}
		} catch {
			// Silently fail
		}
	}

	if (option.bookingSystem === OptionBookingSystem.TURITOP && isIndexedOrCompleted) {
		try {
			turitopProduct = await TURITOP_REQUEST.fetchProduct(fetch, activity.id);
		} catch {
			// Silently fail
		}
	}

	return { activity, option, bokunActivity, pricingCategoryMappings, turitopProduct };
};
