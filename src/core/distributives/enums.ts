/**
 * @module distributives/enums
 * @description Domain enums for the Distributives resource.
 * These mirror the backend contract exactly and carry no UI or i18n dependencies.
 */

/** Role of a location within a distributive. */
export enum DistributiveLocationRole {
	DESTINATION = 'DESTINATION',
	ORIGIN = 'ORIGIN',
	WAYPOINT = 'WAYPOINT'
}

/** Attributes available for sorting distributive lists. */
export enum DistributiveSortAttribute {
	NAME = 'NAME'
}

/** Publication status of a distributive. Controls visibility in the catalog. */
export enum DistributiveStatus {
	DRAFT = 'DRAFT',
	PUBLISHED = 'PUBLISHED'
}
