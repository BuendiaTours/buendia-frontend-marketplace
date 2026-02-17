/**
 * @module destinations/enums
 * @description Domain enums for the Destinations resource.
 * These mirror the backend contract exactly and carry no UI or i18n dependencies.
 */

/** Geographic level of a destination. */
export enum DestinationKind {
	CITY = 'CITY',
	COUNTRY = 'COUNTRY',
	REGION = 'REGION'
}

/** Attributes available for sorting destination lists. */
export enum DestinationSortAttribute {
	NAME = 'NAME'
}
