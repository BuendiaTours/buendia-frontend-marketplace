/**
 * @module payments/enums
 * @description Domain enums for the Payments resource.
 * These mirror the backend contract exactly and carry no UI or i18n dependencies.
 */

/** Currency used for the payment. */
export enum PaymentCurrency {
	EUR = 'EUR',
	GBP = 'GBP',
	USD = 'USD'
}

/** Payment method selected by the user. */
export enum PaymentMethod {
	APPLE_PAY = 'APPLE_PAY',
	BANK_TRANSFER = 'BANK_TRANSFER',
	CARD = 'CARD',
	GOOGLE_PAY = 'GOOGLE_PAY',
	PAYPAL = 'PAYPAL'
}

/** Current lifecycle status of a payment. */
export enum PaymentStatus {
	CANCELLED = 'CANCELLED',
	COMPLETED = 'COMPLETED',
	FAILED = 'FAILED',
	ON_HOLD = 'ON_HOLD',
	PENDING = 'PENDING',
	REFUNDED = 'REFUNDED'
}

// ── Sort ────────────────────────────────────────

/** Attributes available for sorting payment lists. */
export enum PaymentSortAttribute {
	AMOUNT = 'AMOUNT',
	CREATED_AT = 'CREATED_AT'
}
