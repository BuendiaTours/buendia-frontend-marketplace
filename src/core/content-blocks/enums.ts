/**
 * @module content-blocks/enums
 * @description Domain enums for the Content Blocks resource.
 * These mirror the backend contract exactly and carry no UI or i18n dependencies.
 */

/** Kind of content block — determines the format of the target value. */
export enum ContentBlockKind {
	ACTIVITY = 'ACTIVITY',
	URL = 'URL'
}

/** Attributes available for sorting content block lists. */
export enum ContentBlockSortAttribute {
	KIND = 'KIND',
	TARGET = 'TARGET',
	TITLE = 'TITLE'
}
