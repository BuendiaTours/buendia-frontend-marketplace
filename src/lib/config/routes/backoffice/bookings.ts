/**
 * @module routes/backoffice/bookings
 * @description Backoffice route definitions for the Bookings resource.
 */

import { backoffice } from '../core';

/** Backoffice URL helpers for booking pages. */
export const BOOKING_ROUTES = {
	/** Bookings list page. */
	list: backoffice('bookings'),
	/**
	 * Booking detail page.
	 * @param id - Booking identifier.
	 */
	detail: (id: string) => backoffice('bookings', id)
} as const;
