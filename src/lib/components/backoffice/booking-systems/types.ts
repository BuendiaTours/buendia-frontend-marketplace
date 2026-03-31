/**
 * @module booking-systems/types
 * @description Shared contract that every booking system adapter must implement.
 * Each adapter provides its own form component and submit logic, allowing the
 * orchestrator to render and submit any booking system without knowing its internals.
 */

import type { Component } from 'svelte';
import type { BookingSystem } from '$core/bookings/enums';

/** Props passed to every adapter's form component. */
export type BookingSystemFormProps = {
	formData: Record<string, unknown>;
	disabled: boolean;
};

/** Contract that each booking system adapter must fulfill. */
export type BookingSystemAdapter = {
	key: BookingSystem;
	label: string;
	formComponent: Component<BookingSystemFormProps>;
	submit: (
		fetchFn: typeof fetch,
		context: BookingSystemSubmitContext,
		formData: Record<string, unknown>
	) => Promise<void>;
};

/** Contextual data available to every adapter's submit function. */
export type BookingSystemSubmitContext = {
	optionId: string;
	optionTitle: string;
};
