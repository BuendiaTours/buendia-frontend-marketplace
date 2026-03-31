/**
 * @module booking-systems/adapters/turitop
 * @description Adapter for the TuriTop booking system.
 * Defines the form component and submit logic specific to TuriTop.
 */

import { BookingSystem } from '$core/bookings/enums';
import { ACTIVITY_REQUEST } from '$core/activities/requests';
import type { ActivityIndexationPriority } from '$core/activities/enums';
import type { BookingSystemAdapter } from '../../types';
import TuritopForm from './TuritopForm.svelte';

export const turitopAdapter: BookingSystemAdapter = {
	key: BookingSystem.TURITOP,
	label: 'TuriTop',
	formComponent: TuritopForm,
	submit: async (fetchFn, context, formData) => {
		await ACTIVITY_REQUEST.indexActivity(fetchFn, {
			bookingSystem: BookingSystem.TURITOP,
			bookingSystemId: (formData.bookingSystemId as string).trim(),
			coreId: context.optionId,
			coreTitle: context.optionTitle,
			priority: formData.priority as ActivityIndexationPriority
		});
	}
};
