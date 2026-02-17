/**
 * @module multimedia/requests
 * @description API request functions for the Multimedia resource.
 * Provides standard CRUD operations, criteria-based querying,
 * presigned upload URLs, and retry processing.
 */

import type { CriteriaResult } from '$core/_shared/types';
import { get, getWithParams, post, patch, del } from '$core/_shared/helpers';
import type {
	Media,
	MediaCreateDto,
	MediaCriteria,
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
