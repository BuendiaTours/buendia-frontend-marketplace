/**
 * @module categories/enums
 * @description Domain enums for the Categories resource.
 * These mirror the backend contract exactly and carry no UI or i18n dependencies.
 */

/** Scope of a category (global across all destinations or local to one). */
export enum CategoryKind {
	GLOBAL = 'GLOBAL',
	LOCAL = 'LOCAL'
}

/** Lifecycle status of a category. */
export enum CategoryStatus {
	ACTIVE = 'ACTIVE',
	DRAFT = 'DRAFT',
	INACTIVE = 'INACTIVE'
}

/** Attributes available for sorting category lists. */
export enum CategorySortAttribute {
	NAME = 'NAME'
}
