/**
 * @module users/enums
 * @description Domain enums for the Users resource.
 * These mirror the backend contract exactly and carry no UI or i18n dependencies.
 */

/** Account type classification. */
export enum UserKind {
	CLIENT = 'CLIENT',
	ADMIN = 'ADMIN'
}

/** Functional role assigned to an admin user. */
export enum UserRole {
	SUPPLY = 'SUPPLY',
	CUSTOMER_ATTENDANT = 'CUSTOMER_ATTENDANT',
	FINANCES = 'FINANCES',
	CONTENT = 'CONTENT'
}

/** Account lifecycle status. */
export enum UserStatus {
	ACTIVE = 'ACTIVE',
	INACTIVE = 'INACTIVE',
	SUSPENDED = 'SUSPENDED'
}

/** Attributes available for sorting user lists. */
export enum UserSortAttribute {
	NAME = 'NAME'
}
