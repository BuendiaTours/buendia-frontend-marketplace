/**
 * @module attractions/enums
 * @description Domain enums for the Attractions resource.
 * These mirror the backend contract exactly and carry no UI or i18n dependencies.
 */

/** Lifecycle status of an attraction. */
export enum AttractionStatus {
	ACTIVE = 'ACTIVE',
	DRAFT = 'DRAFT',
	INACTIVE = 'INACTIVE'
}

/** Kind of location associated with an attraction. */
export enum AttractionLocationKind {
	CITY = 'CITY',
	COUNTRY = 'COUNTRY',
	REGION = 'REGION'
}

/** Attributes available for sorting attraction lists. */
export enum AttractionSortAttribute {
	NAME = 'NAME'
}
