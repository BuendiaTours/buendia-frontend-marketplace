/**
 * @module faqs/enums
 * @description Domain enums for the FAQs and FAQ Relationships resources.
 * These mirror the backend contract exactly and carry no UI or i18n dependencies.
 */

// ── FAQ ────────────────────────────────────────────

/** Publication status of a FAQ. */
export enum FaqStatus {
	DRAFT = 'DRAFT',
	PUBLISHED = 'PUBLISHED'
}

/** Filter for querying FAQs by scope. */
export enum FaqScopeFilter {
	GLOBAL = 'GLOBAL',
	ACTIVITY = 'ACTIVITY'
}

/** Attributes available for sorting FAQ lists. */
export enum FaqSort {
	CREATED_AT = 'CREATED_AT',
	UPDATED_AT = 'UPDATED_AT',
	STATUS = 'STATUS',
	QUESTION = 'QUESTION'
}

// ── FAQ Relationship ───────────────────────────────

/** Type of entity a FAQ can be linked to. */
export enum FaqRelationshipEntityType {
	ACTIVITY = 'ACTIVITY',
	DISTRIBUTIVE = 'DISTRIBUTIVE'
}

/** Attributes available for sorting FAQ relationship lists. */
export enum FaqRelationshipSort {
	POSITION = 'position',
	CREATED_AT = 'createdAt'
}
