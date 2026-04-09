/**
 * @module checkout/enums
 * @description Domain enums for the Checkout resource.
 * These mirror the backend contract exactly and carry no UI or i18n dependencies.
 */

/** Passenger/participant category for pricing and capacity purposes. */
export enum PassengerKind {
	ADULT = 'ADULT',
	ALL = 'ALL',
	CHILD = 'CHILD',
	CITIZEN_EU = 'CITIZEN_EU',
	INFANT = 'INFANT',
	SENIOR = 'SENIOR',
	STUDENT = 'STUDENT',
	STUDENT_EU = 'STUDENT_EU',
	YOUTH = 'YOUTH'
}
