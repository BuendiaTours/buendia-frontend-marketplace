/**
 * @module multimedia/types
 * @description TypeScript type definitions for the Multimedia resource.
 * Organised into Projections (read), DTOs (write), and Criteria (query).
 */

import type {
	MediaKind,
	MediaRelationshipEntityType,
	MediaRelationshipSortAttribute,
	MediaSortAttribute,
	MediaStatus,
	MediaVariantFormat,
	MediaVariantPreset
} from '$core/multimedia/enums';
import type { CriteriaOperator, CriteriaSortOption } from '$core/_shared/enums';

// ── Projections (read models) ───────────────────

/** Per-preset focal point embedded within a media projection. */
export type MediaPresetFocalPoint = {
	id: string;
	preset: MediaVariantPreset;
	scale: number;
	x: number;
	y: number;
};

/** Generated image variant embedded within a media projection. */
export type MediaVariant = {
	id: string;
	format: MediaVariantFormat;
	height: number;
	preset: MediaVariantPreset;
	sizeBytes: number;
	url: string;
	width: number;
};

/** Full media projection as returned by the API. */
export type Media = {
	id: string;
	altText: string;
	createdAt: string;
	focalPoints: MediaPresetFocalPoint[];
	kind: MediaKind;
	mimeType: string;
	originalHeight: number;
	originalSizeBytes: number;
	originalUrl: string;
	originalWidth: number;
	status: MediaStatus;
	title: string;
	updatedAt: string;
	variants: MediaVariant[];
};

// ── DTOs (write models) ─────────────────────────

/** Payload for creating a new media asset. */
export type MediaCreateDto = {
	id: string;
	altText: string;
	kind: MediaKind;
	mimeType: string;
	originalHeight: number;
	originalSizeBytes: number;
	originalUrl: string;
	originalWidth: number;
	title: string;
};

/** Payload for partially updating an existing media asset. */
export type MediaUpdateDto = {
	altText?: string;
	title?: string;
	focalPoints?: Record<string, { x: number; y: number; scale: number } | null>;
};

/** Payload for requesting a presigned S3 upload URL. */
export type MediaUploadUrlDto = {
	fileName: string;
	mimeType: string;
	fileSize: number;
};

/** Response from the upload-url endpoint. */
export type MediaUploadUrlResponse = {
	url: string;
	key: string;
	expiresIn: number;
};

// ── Criteria (query params) ─────────────────────

/** Query parameters for filtering, sorting, and paginating media lists. */
export type MediaCriteria = {
	skip?: number;
	limit?: number;
	kind?: MediaKind;
	search_text?: string;
	status?: MediaStatus;
	title?: string;
	sort?: MediaSortAttribute;
	operator?: CriteriaOperator;
	order?: CriteriaSortOption;
};

// ── Media Relationship ──────────────────────────

// ── Projections (read models) ───────────────────

/** Media relationship projection as returned by the API. */
export type MediaRelationship = {
	id: string;
	entityId: string;
	mediaId: string;
	entityType: MediaRelationshipEntityType;
	order: number;
	createdAt: string;
	updatedAt: string;
};

// ── DTOs (write models) ─────────────────────────

/** Payload for creating a new media relationship. */
export type MediaRelationshipCreateDto = {
	id: string;
	entityId: string;
	mediaId: string;
	entityType: MediaRelationshipEntityType;
};

/** Single item in a reorder request. */
export type MediaRelationshipReorderItem = {
	id: string;
	order: number;
};

/** Payload for reordering media relationships. */
export type MediaRelationshipReorderDto = {
	items: MediaRelationshipReorderItem[];
};

// ── Criteria (query params) ─────────────────────

/** Query parameters for filtering, sorting, and paginating media relationship lists. */
export type MediaRelationshipCriteria = {
	skip?: number;
	limit?: number;
	entityId?: string;
	entityType?: MediaRelationshipEntityType;
	mediaId?: string;
	sort?: MediaRelationshipSortAttribute;
	operator?: CriteriaOperator;
	order?: CriteriaSortOption;
};
