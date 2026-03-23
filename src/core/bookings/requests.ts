/**
 * @module bookings/requests
 * @description API request functions for the Bookings resource.
 * Provides CRUD operations and passenger management.
 * Note: booking creation is done via the Orders resource (POST /orders/:orderId/bookings).
 */

import type { CriteriaResult } from '$core/_shared/types';
import { get, getWithParams, post, patch, del } from '$core/_shared/helpers';
import type {
	Booking,
	BookingAddPassengersDto,
	BookingCreateDto,
	BookingCriteria,
	BookingUpdateDto,
	BookingUpdatePassengerDto
} from '$core/bookings/types';

/** @internal Base API path for the bookings resource. */
const BASE = '/bookings';

/**
 * Namespace containing all API request methods for bookings.
 * Each method accepts the SvelteKit-provided `fetch` as its first argument
 * to preserve SSR compatibility and cookie forwarding.
 */
export const BOOKING_REQUEST = {
	// ── Queries ──────────────────────────────────

	/**
	 * Retrieves a single booking by its ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Booking ID.
	 */
	findById: (fetchFn: typeof fetch, id: string): Promise<Booking> =>
		get<Booking>(fetchFn, `${BASE}/${id}`),

	/**
	 * Queries bookings using criteria-based filtering and pagination.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param criteria - Optional filter, sort, and pagination parameters.
	 */
	findByCriteria: (
		fetchFn: typeof fetch,
		criteria?: BookingCriteria
	): Promise<CriteriaResult<Booking>> =>
		getWithParams<CriteriaResult<Booking>>(fetchFn, BASE, criteria),

	// ── Mutations ────────────────────────────────

	/**
	 * Creates a booking within an existing order.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param orderId - Order ID to add the booking to.
	 * @param data - Booking creation payload.
	 */
	create: (fetchFn: typeof fetch, orderId: string, data: BookingCreateDto): Promise<void> =>
		post(fetchFn, `/orders/${orderId}/bookings`, data),

	/**
	 * Partially updates an existing booking.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Booking ID.
	 * @param data - Fields to update.
	 */
	update: (fetchFn: typeof fetch, id: string, data: BookingUpdateDto): Promise<void> =>
		patch(fetchFn, `${BASE}/${id}`, data),

	/**
	 * Deletes a booking by ID (cascades to delete the order if empty).
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Booking ID.
	 */
	delete: (fetchFn: typeof fetch, id: string): Promise<void> => del(fetchFn, `${BASE}/${id}`),

	// ── Passengers ──────────────────────────────

	/**
	 * Adds passengers to an existing booking.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Booking ID.
	 * @param data - Passengers to add.
	 */
	addPassengers: (
		fetchFn: typeof fetch,
		id: string,
		data: BookingAddPassengersDto
	): Promise<void> => post(fetchFn, `${BASE}/${id}/passengers`, data),

	/**
	 * Updates a passenger within a booking.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param bookingId - Booking ID.
	 * @param passengerId - Passenger ID.
	 * @param data - Fields to update.
	 */
	updatePassenger: (
		fetchFn: typeof fetch,
		bookingId: string,
		passengerId: string,
		data: BookingUpdatePassengerDto
	): Promise<void> => patch(fetchFn, `${BASE}/${bookingId}/passengers/${passengerId}`, data),

	/**
	 * Removes a passenger from a booking.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param bookingId - Booking ID.
	 * @param passengerId - Passenger ID.
	 */
	removePassenger: (fetchFn: typeof fetch, bookingId: string, passengerId: string): Promise<void> =>
		del(fetchFn, `${BASE}/${bookingId}/passengers/${passengerId}`)
};
