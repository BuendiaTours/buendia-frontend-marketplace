/**
 * @module locations/enums
 * @description Domain enums for the Locations resource.
 * These mirror the backend contract exactly and carry no UI or i18n dependencies.
 */

/** Geographic level of a location. */
export enum LocationKind {
	CITY = 'CITY',
	COUNTRY = 'COUNTRY',
	REGION = 'REGION'
}

/** Attributes available for sorting location lists. */
export enum LocationSortAttribute {
	NAME = 'NAME'
}
