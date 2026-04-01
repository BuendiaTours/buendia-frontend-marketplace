/**
 * @module booking-systems/types
 * @description Shared contract that every booking system adapter must implement.
 * Each adapter provides a full integration component that handles
 * indexing, mapping, and completed states internally.
 */

import type { Component } from 'svelte';
import type { OptionBookingSystem } from '$core/activity-options/enums';

/** Props passed to every adapter's integration component. */
export type BookingSystemIntegrationProps = {
	activity: { id: string; title: string };
	option: {
		id: string;
		title: string;
		bookingSystem: OptionBookingSystem;
		integrationStatus: string;
		supplierOptionCode: string | null;
		ticketKind: string | null;
		individualTickets: Array<{ id: string; group: string }>;
		groupTickets: Array<{ id: string }>;
	};
	isEditable: boolean;
	isActivityIndexed: boolean;
	isCompleted: boolean;
	bookingSystemData: unknown;
	addToast: (toast: {
		data: { title: string; description: string; type: 'success' | 'error' };
	}) => void;
};

/** Contract that each booking system adapter must fulfill. */
export type BookingSystemAdapter = {
	key: OptionBookingSystem;
	label: string;
	integrationComponent: Component<BookingSystemIntegrationProps>;
};
