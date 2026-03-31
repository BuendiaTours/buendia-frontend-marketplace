/**
 * @module tags/enums
 * @description Domain enums for the Tags resource.
 * These mirror the backend contract exactly and carry no UI or i18n dependencies.
 */

/** Attributes available for sorting tag lists. */
export enum TagSortAttribute {
	NAME = 'NAME'
}

// ── Tag Relationship ───────────────────────────

/** Allowed entity types that can be linked to a tag through a tag relationship. */
export enum TagRelationshipKind {
	ACTIVITY = 'ACTIVITY',
	ATTRACTION = 'ATTRACTION',
	OPTION = 'OPTION'
}

/** Attributes available for sorting tag relationship lists. */
export enum TagRelationshipSortAttribute {
	KIND = 'KIND'
}
