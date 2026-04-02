/**
 * @module bookings/enums
 * @description Domain enums for the Bookings resource.
 * These mirror the backend contract exactly and carry no UI or i18n dependencies.
 */

/** Current lifecycle status of a booking. */
export enum BookingStatus {
	CANCELLED = 'CANCELLED',
	CONFIRMED = 'CONFIRMED',
	EXPIRED = 'EXPIRED',
	FAILED = 'FAILED',
	PENDING = 'PENDING',
	RETRYING = 'RETRYING'
}

/** External booking system provider. */
export enum BookingSystem {
	BOKUN = 'BOKUN',
	TURITOP = 'TURITOP'
}

/** Format/type of a voucher attached to a booking. */
export enum VoucherKind {
	BARCODE = 'BARCODE',
	EXTERNAL_URL = 'EXTERNAL_URL',
	PDF = 'PDF',
	QR_CODE = 'QR_CODE',
	TEXT = 'TEXT'
}

// ── Sort ────────────────────────────────────────

/** Attributes available for sorting booking lists. */
export enum BookingSortAttribute {
	ACTIVITY_DATETIME = 'ACTIVITY_DATETIME',
	CREATED_AT = 'CREATED_AT',
	UPDATED_AT = 'UPDATED_AT'
}
