import { BookingStatus } from '$core/bookings/enums';
import { BookingSystem } from '$core/bookings/enums';
import { PaymentMethod, PaymentStatus } from '$core/payments/enums';
import { ActivityIndexationPriority, CoreActivityStatus } from '$core/activities/enums';
import * as m from '$paraglide/messages';

export const BOOKING_STATUS_OPTIONS = [
	{ id: BookingStatus.CONFIRMED, name: m.enum_bookingStatus_confirmed() },
	{ id: BookingStatus.PENDING, name: m.enum_bookingStatus_pending() },
	{ id: BookingStatus.RETRYING, name: m.enum_bookingStatus_retrying() },
	{ id: BookingStatus.FAILED, name: m.enum_bookingStatus_failed() },
	{ id: BookingStatus.CANCELLED, name: m.enum_bookingStatus_cancelled() },
	{ id: BookingStatus.EXPIRED, name: m.enum_bookingStatus_expired() }
];

export const BOOKING_SYSTEM_OPTIONS = [
	{ id: BookingSystem.BOKUN, name: m.enum_bookingSystem_bokun() },
	{ id: BookingSystem.TURITOP, name: m.enum_bookingSystem_turitop() }
];

export const PAYMENT_METHOD_OPTIONS = [
	{ id: PaymentMethod.CARD, name: m.enum_paymentMethod_card() },
	{ id: PaymentMethod.APPLE_PAY, name: m.enum_paymentMethod_applePay() },
	{ id: PaymentMethod.GOOGLE_PAY, name: m.enum_paymentMethod_googlePay() },
	{ id: PaymentMethod.PAYPAL, name: m.enum_paymentMethod_paypal() },
	{ id: PaymentMethod.BANK_TRANSFER, name: m.enum_paymentMethod_bankTransfer() }
];

export const PAYMENT_STATUS_OPTIONS = [
	{ id: PaymentStatus.PENDING, name: m.enum_paymentStatus_pending() },
	{ id: PaymentStatus.COMPLETED, name: m.enum_paymentStatus_completed() },
	{ id: PaymentStatus.FAILED, name: m.enum_paymentStatus_failed() },
	{ id: PaymentStatus.CANCELLED, name: m.enum_paymentStatus_cancelled() },
	{ id: PaymentStatus.REFUNDED, name: m.enum_paymentStatus_refunded() },
	{ id: PaymentStatus.ON_HOLD, name: m.enum_paymentStatus_onHold() }
];

export const INDEXATION_PRIORITY_OPTIONS = [
	{ id: ActivityIndexationPriority.HIGH, name: m.enum_indexationPriority_high() },
	{ id: ActivityIndexationPriority.MEDIUM, name: m.enum_indexationPriority_medium() },
	{ id: ActivityIndexationPriority.LOW, name: m.enum_indexationPriority_low() },
	{ id: ActivityIndexationPriority.NONE, name: m.enum_indexationPriority_none() }
];

export const CORE_ACTIVITY_STATUS_OPTIONS = [
	{ id: CoreActivityStatus.ACTIVE, name: m.enum_coreActivityStatus_active() },
	{ id: CoreActivityStatus.FAILED, name: m.enum_coreActivityStatus_failed() },
	{ id: CoreActivityStatus.INACTIVE, name: m.enum_coreActivityStatus_inactive() },
	{ id: CoreActivityStatus.PENDING, name: m.enum_coreActivityStatus_pending() },
	{ id: CoreActivityStatus.PENDING_TO_MATCH, name: m.enum_coreActivityStatus_pendingToMatch() },
	{ id: CoreActivityStatus.RUNNING, name: m.enum_coreActivityStatus_running() }
];
