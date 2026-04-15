/**
 * @module free-tours/enums
 * @description Domain enums for the Free Tours resource.
 * These mirror the backend contract exactly and carry no UI or i18n dependencies.
 */

/** Attributes available for sorting free tour lists. */
export enum FreeTourSortAttribute {
	TITLE = 'title',
	CREATED_AT = 'createdAt'
}

/** Publication status of a free tour. Controls visibility in the catalog. */
export enum FreeTourStatus {
	DRAFT = 'DRAFT',
	PUBLISHED = 'PUBLISHED',
	UNPUBLISHED = 'UNPUBLISHED'
}

/** Type of stage within a free tour itinerary. */
export enum StageKind {
	EXPERIENCE = 'EXPERIENCE',
	TRANSFER = 'TRANSFER'
}

/** How important a stage is within the itinerary. */
export enum StageRelevance {
	HIGH = 'HIGH',
	LOW = 'LOW',
	MEDIUM = 'MEDIUM',
	NONE = 'NONE'
}

/** Whether a stage is mandatory or optional. */
export enum StageRequirement {
	NONE = 'NONE',
	OPTIONAL = 'OPTIONAL',
	REQUIRED = 'REQUIRED',
	SUGGESTED = 'SUGGESTED'
}
