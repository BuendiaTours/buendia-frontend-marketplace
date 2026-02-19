/**
 * @module multimedia/enums
 * @description Domain enums for the Multimedia resource.
 * These mirror the backend contract exactly and carry no UI or i18n dependencies.
 */

/** Type of media content stored in the system. */
export enum MediaKind {
	IMAGE = 'IMAGE',
	VIDEO = 'VIDEO'
}

/** Processing lifecycle status of a media asset. */
export enum MediaStatus {
	PENDING = 'PENDING',
	PROCESSING = 'PROCESSING',
	READY = 'READY',
	FAILED = 'FAILED'
}

/** Output image formats for generated variants. */
export enum MediaVariantFormat {
	WEBP = 'WEBP',
	AVIF = 'AVIF',
	JPEG = 'JPEG'
}

/** Predefined size/crop presets for generated image variants. */
export enum MediaVariantPreset {
	HERO_DESKTOP = 'HERO_DESKTOP',
	HERO_MOBILE = 'HERO_MOBILE',
	CARD = 'CARD',
	THUMBNAIL = 'THUMBNAIL'
}

/** Attributes available for sorting media lists. */
export enum MediaSortAttribute {
	TITLE = 'title',
	CREATED_AT = 'createdAt'
}
