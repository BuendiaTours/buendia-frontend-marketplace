import { BookingStatus } from '$core/bookings/enums';
import { BookingSystem } from '$core/bookings/enums';
import * as m from '$paraglide/messages';

export const BOOKING_STATUS_OPTIONS = [
	{ id: BookingStatus.CONFIRMED, name: m.enum_bookingStatus_confirmed() },
	{ id: BookingStatus.PENDING, name: m.enum_bookingStatus_pending() },
	{ id: BookingStatus.RETRYING, name: m.enum_bookingStatus_retrying() },
	{ id: BookingStatus.FAILED, name: m.enum_bookingStatus_failed() },
	{ id: BookingStatus.CANCELLED, name: m.enum_bookingStatus_cancelled() }
];

export const BOOKING_SYSTEM_OPTIONS = [
	{ id: BookingSystem.BOKUN, name: m.enum_bookingSystem_bokun() },
	{ id: BookingSystem.TURITOP, name: m.enum_bookingSystem_turitop() }
];
