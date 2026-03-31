/**
 * @module booking-systems/adapters/bokun
 * @description Adapter for the Bokun booking system.
 * Defines the form component and submit logic specific to Bokun.
 */

import { BookingSystem } from '$core/bookings/enums';
import { ACTIVITY_REQUEST } from '$core/activities/requests';
import type { ActivityIndexationPriority } from '$core/activities/enums';
import type { BookingSystemAdapter } from '../../types';
import BokunForm from './BokunForm.svelte';

export const bokunAdapter: BookingSystemAdapter = {
	key: BookingSystem.BOKUN,
	label: 'Bokun',
	formComponent: BokunForm,
	submit: async (fetchFn, context, formData) => {
		await ACTIVITY_REQUEST.indexActivity(fetchFn, {
			bookingSystem: BookingSystem.BOKUN,
			bookingSystemId: (formData.bookingSystemId as string).trim(),
			coreId: context.optionId,
			coreTitle: context.optionTitle,
			priority: formData.priority as ActivityIndexationPriority
		});
	}
};
