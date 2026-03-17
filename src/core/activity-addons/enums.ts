/**
 * @module activity-addons/enums
 * @description Domain enums for the Activity Addons resource.
 * These mirror the backend contract exactly and carry no UI or i18n dependencies.
 */

/** Defines whether an addon is optional or required for a given activity option. */
export enum ActivityAddonOptionKind {
	OPTIONAL = 'OPTIONAL',
	REQUIRED = 'REQUIRED'
}
