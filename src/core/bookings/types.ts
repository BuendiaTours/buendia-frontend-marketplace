/**
 * @module bookings/types
 * @description TypeScript type definitions for the Bookings resource.
 * Organized into three sections:
 * - **Projections** (read models returned by the API)
 * - **DTOs** (write models sent to the API)
 * - **Criteria** (query parameters for filtering and pagination)
 */

import type {
	BookingSortAttribute,
	BookingStatus,
	BookingSystem,
	VoucherKind
} from '$core/bookings/enums';
import type { CriteriaOperator, CriteriaSortOption } from '$core/_shared/enums';
import type { Coords } from '$core/_shared/types';

// ── Projections (read models) ───────────────────

/** Answer to a question, with server-resolved description. */
export type BookingAnswer = {
	questionId: string;
	description: string;
	values: string[];
};

/** Addon attached to a booking. */
export type BookingAddon = {
	id: string;
	bookingId: string;
	answers: BookingAnswer[];
	quantity: number;
	unitPrice: number;
};

/** Hotel selection within a booking. */
export type BookingHotel = {
	id: string;
	name: string;
};

/** Details about the most recent booking system error. */
export type BookingLastError = {
	attempt: number;
	errorMessage: string;
	errorType: string;
	maxAttempts: number;
};

/** Passenger within a booking. */
export type BookingPassenger = {
	id: string;
	bookingId: string;
	individualTicketId: string;
	answers: BookingAnswer[];
	group: string;
	isMainPax: boolean;
	priceAtBooking: number;
	unitCommission: number;
};

/** Payment data from the payment provider. */
export type BookingPaymentData = {
	amount: number;
	cardBrand: string;
	currency: string;
	last4: string;
	paymentIntentId: string;
};

/** Pickup or dropoff point with resolved location details. */
export type BookingPickupPoint = {
	id: string;
	bookingId: string;
	pickupPointId: string;
	address: string | null;
	answers: BookingAnswer[];
	city: string | null;
	coords: Coords | null;
	countryCode: string | null;
	name: string;
	postCode: string | null;
};

/** Voucher attached to a booking. */
export type BookingVoucher = {
	id: string;
	bookingId: string;
	kind: VoucherKind;
	value: string;
};

/** Full booking projection as returned by the API. */
export type Booking = {
	id: string;
	orderId: string;
	activityId: string;
	legibleId: string;
	optionId: string;
	startTime: string;
	addons: BookingAddon[];
	bookingAnswers: BookingAnswer[];
	bookingSystem: BookingSystem;
	confirmationCode: string | null;
	createdAt: string;
	date: string;
	dropoffPoint: BookingPickupPoint | null;
	externalBookingId: string | null;
	hotel: BookingHotel | null;
	lastError: BookingLastError | null;
	passengers: BookingPassenger[];
	paymentData: BookingPaymentData | null;
	pickupPoint: BookingPickupPoint | null;
	reserveExpiry: string | null;
	snapshot: Record<string, unknown>;
	status: BookingStatus;
	subtotalCommission: number;
	subtotalPrice: number;
	ticketKind: string;
	updatedAt: string;
	vouchers: BookingVoucher[];
};

// ── DTOs (write models) ─────────────────────────

/** Answer payload for a question. */
export type BookingAnswerDto = {
	questionId: string;
	values: string[];
};

/** Addon selection within a booking request. */
export type BookingAddonDto = {
	id: string;
	answers?: BookingAnswerDto[];
	quantity: number;
};

/** Hotel selection within a booking request (numeric ID). */
export type BookingHotelDto = {
	id: number;
};

/** Payment data within a booking creation request. */
export type BookingPaymentDataDto = {
	amount: number;
	cardBrand: string;
	currency: string;
	last4: string;
	paymentIntentId: string;
};

/** Passenger within a booking creation request. */
export type BookingPassengerDto = {
	id: string;
	individualTicketId: string;
};

/** Pickup/dropoff point selection within a booking request. */
export type BookingPickupPointDto = {
	pickupPointId: string;
	answers?: BookingAnswerDto[];
};

/** Payload for creating a booking within an order. */
export type BookingCreateDto = {
	id: string;
	optionId: string;
	activityDatetime: string;
	addons?: BookingAddonDto[];
	bookingAnswers?: BookingAnswerDto[];
	dropoffPoint?: BookingPickupPointDto;
	hotel?: BookingHotelDto;
	passengers: BookingPassengerDto[];
	paymentData?: BookingPaymentDataDto;
	pickupPoint?: BookingPickupPointDto;
};

/** Payload for partially updating a booking. */
export type BookingUpdateDto = {
	addons?: BookingAddonDto[];
	bookingAnswers?: BookingAnswerDto[];
	dropoffPoint?: BookingPickupPointDto;
	hotel?: BookingHotelDto;
	pickupPoint?: BookingPickupPointDto;
	reserveExpiry?: string;
	snapshot?: Record<string, unknown>;
	status?: BookingStatus;
};

/** Passenger within an add-passengers request. */
export type BookingAddPassengersPassengerDto = {
	id: string;
	individualTicketId: string;
};

/** Payload for adding passengers to an existing booking. */
export type BookingAddPassengersDto = {
	passengers: BookingAddPassengersPassengerDto[];
};

/** Payload for updating a passenger within a booking. */
export type BookingUpdatePassengerDto = {
	answers?: BookingAnswerDto[];
	isMainPax?: boolean;
};

// ── Criteria (query params) ─────────────────────

/** Query parameters for filtering, sorting, and paginating booking lists. */
export type BookingCriteria = {
	activityId?: string;
	legibleId?: string;
	orderId?: string;
	status?: BookingStatus;
	skip?: number;
	limit?: number;
	sort?: BookingSortAttribute;
	operator?: CriteriaOperator;
	order?: CriteriaSortOption;
};
