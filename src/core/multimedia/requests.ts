/**
 * @module multimedia/requests
 * @description API request functions for the Multimedia resource.
 * Provides standard CRUD operations, criteria-based querying,
 * presigned upload URLs, retry processing, and media relationship management.
 */

import type { CriteriaResult } from '$core/_shared/types';
import { get, getWithParams, post, patch, del } from '$core/_shared/helpers';
import type {
	Media,
	MediaCreateDto,
	MediaCriteria,
	MediaRelationship,
	MediaRelationshipCreateDto,
	MediaRelationshipCriteria,
	MediaRelationshipReorderDto,
	MediaUpdateDto,
	MediaUploadUrlDto,
	MediaUploadUrlResponse
} from '$core/multimedia/types';

/** @internal Base API path for the media resource. */
const BASE = '/media';

/**
 * Namespace containing all API request methods for media.
 * Each method accepts the SvelteKit-provided `fetch` as its first argument.
 */
export const MEDIA_REQUEST = {
	/**
	 * Creates a new media asset.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param data - Media creation payload.
	 */
	create: (fetchFn: typeof fetch, data: MediaCreateDto): Promise<void> => post(fetchFn, BASE, data),

	/**
	 * Partially updates an existing media asset.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Media ID.
	 * @param data - Fields to update.
	 */
	update: (fetchFn: typeof fetch, id: string, data: MediaUpdateDto): Promise<void> =>
		patch(fetchFn, `${BASE}/${id}`, data),

	/**
	 * Deletes a media asset by ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Media ID.
	 */
	delete: (fetchFn: typeof fetch, id: string): Promise<void> => del(fetchFn, `${BASE}/${id}`),

	/**
	 * Retrieves a single media asset by its ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Media ID.
	 */
	findById: (fetchFn: typeof fetch, id: string): Promise<Media> =>
		get<Media>(fetchFn, `${BASE}/${id}`),

	/**
	 * Queries media using criteria-based filtering and pagination.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param criteria - Optional filter, sort, and pagination parameters.
	 */
	findByCriteria: (
		fetchFn: typeof fetch,
		criteria?: MediaCriteria
	): Promise<CriteriaResult<Media>> =>
		getWithParams<CriteriaResult<Media>>(fetchFn, BASE, criteria),

	/**
	 * Generates a presigned URL for direct client-to-S3 upload.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param data - Upload URL request payload (fileName, mimeType, fileSize).
	 */
	getUploadUrl: (fetchFn: typeof fetch, data: MediaUploadUrlDto): Promise<MediaUploadUrlResponse> =>
		post<MediaUploadUrlResponse>(fetchFn, `${BASE}/upload-url`, data),

	/**
	 * Retries variant processing for a FAILED media asset.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Media ID.
	 */
	retryProcessing: (fetchFn: typeof fetch, id: string): Promise<void> =>
		post(fetchFn, `${BASE}/${id}/retry`, {})
};

// ── Media Relationships ─────────────────────────

/** @internal Base API path for the media-relationship resource. */
const RELATIONSHIP_BASE = '/media-relationships';

/**
 * Namespace containing all API request methods for media relationships.
 * Each method accepts the SvelteKit-provided `fetch` as its first argument.
 */
export const MEDIA_RELATIONSHIP_REQUEST = {
	/**
	 * Creates a new media relationship.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param data - Media relationship creation payload.
	 */
	create: (fetchFn: typeof fetch, data: MediaRelationshipCreateDto): Promise<void> =>
		post(fetchFn, RELATIONSHIP_BASE, data),

	/**
	 * Deletes a media relationship by ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Media relationship ID.
	 */
	delete: (fetchFn: typeof fetch, id: string): Promise<void> =>
		del(fetchFn, `${RELATIONSHIP_BASE}/${id}`),

	/**
	 * Retrieves a single media relationship by its ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - Media relationship ID.
	 */
	findById: (fetchFn: typeof fetch, id: string): Promise<MediaRelationship> =>
		get<MediaRelationship>(fetchFn, `${RELATIONSHIP_BASE}/${id}`),

	/**
	 * Queries media relationships using criteria-based filtering and pagination.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param criteria - Optional filter, sort, and pagination parameters.
	 */
	findByCriteria: (
		fetchFn: typeof fetch,
		criteria?: MediaRelationshipCriteria
	): Promise<CriteriaResult<MediaRelationship>> =>
		getWithParams<CriteriaResult<MediaRelationship>>(fetchFn, RELATIONSHIP_BASE, criteria),

	/**
	 * Reorders media relationships by updating their display order.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param data - Reorder payload with items and their new positions.
	 */
	reorder: (fetchFn: typeof fetch, data: MediaRelationshipReorderDto): Promise<void> =>
		patch(fetchFn, `${RELATIONSHIP_BASE}/reorder`, data)
};
