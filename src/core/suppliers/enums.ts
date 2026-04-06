/**
 * @module suppliers/enums
 * @description Domain enums for the Suppliers resource.
 * These mirror the backend contract exactly and carry no UI or i18n dependencies.
 */

/** Commission model kind for supplier agreements. */
export enum CommissionKind {
	FIXED = 'FIXED',
	PERCENTAGE = 'PERCENTAGE'
}

/** Lifecycle status of a supplier. */
export enum SupplierStatus {
	ACTIVE = 'ACTIVE',
	DRAFT = 'DRAFT',
	INACTIVE = 'INACTIVE'
}

/** Attributes available for sorting supplier lists. */
export enum SupplierSortAttribute {
	NAME = 'NAME'
}
