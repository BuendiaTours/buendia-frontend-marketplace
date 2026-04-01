/**
 * @module faqs/requests
 * @description API request functions for the FAQs and FAQ Relationships resources.
 * Provides CRUD operations for FAQs and relationship management (link, unlink, reorder).
 */

import type { CriteriaResult } from '$core/_shared/types';
import { get, getWithParams, post, patch, del } from '$core/_shared/helpers';
import type {
	Faq,
	FaqCreateDto,
	FaqCriteria,
	FaqRelationship,
	FaqRelationshipCreateDto,
	FaqRelationshipCriteria,
	FaqRelationshipReorderDto,
	FaqUpdateDto
} from '$core/faqs/types';

/** @internal Base API path for the FAQs resource. */
const FAQ_BASE = '/faqs';

/** @internal Base API path for the FAQ relationships resource. */
const FAQ_RELATIONSHIP_BASE = '/faq-relationships';

/**
 * Namespace containing all API request methods for FAQs.
 * Each method accepts the SvelteKit-provided `fetch` as its first argument
 * to preserve SSR compatibility and cookie forwarding.
 */
export const FAQ_REQUEST = {
	// ── CRUD ─────────────────────────────────────

	/**
	 * Creates a new FAQ.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param data - FAQ creation payload.
	 */
	create: (fetchFn: typeof fetch, data: FaqCreateDto): Promise<void> =>
		post(fetchFn, FAQ_BASE, data),

	/**
	 * Partially updates an existing FAQ.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - FAQ ID.
	 * @param data - Fields to update.
	 */
	update: (fetchFn: typeof fetch, id: string, data: FaqUpdateDto): Promise<void> =>
		patch(fetchFn, `${FAQ_BASE}/${id}`, data),

	/**
	 * Deletes a FAQ by ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - FAQ ID.
	 */
	delete: (fetchFn: typeof fetch, id: string): Promise<void> => del(fetchFn, `${FAQ_BASE}/${id}`),

	/**
	 * Retrieves a single FAQ by its ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - FAQ ID.
	 */
	findById: (fetchFn: typeof fetch, id: string): Promise<Faq> =>
		get<Faq>(fetchFn, `${FAQ_BASE}/${id}`),

	/**
	 * Queries FAQs using criteria-based filtering and pagination.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param criteria - Optional filter, sort, and pagination parameters.
	 */
	findByCriteria: (fetchFn: typeof fetch, criteria?: FaqCriteria): Promise<CriteriaResult<Faq>> =>
		getWithParams<CriteriaResult<Faq>>(fetchFn, FAQ_BASE, criteria)
};

/**
 * Namespace containing all API request methods for FAQ relationships.
 * Each method accepts the SvelteKit-provided `fetch` as its first argument
 * to preserve SSR compatibility and cookie forwarding.
 */
export const FAQ_RELATIONSHIP_REQUEST = {
	// ── CRUD ─────────────────────────────────────

	/**
	 * Creates a new FAQ relationship (links a FAQ to an entity).
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param data - FAQ relationship creation payload.
	 */
	create: (fetchFn: typeof fetch, data: FaqRelationshipCreateDto): Promise<void> =>
		post(fetchFn, FAQ_RELATIONSHIP_BASE, data),

	/**
	 * Deletes a FAQ relationship by ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - FAQ relationship ID.
	 */
	delete: (fetchFn: typeof fetch, id: string): Promise<void> =>
		del(fetchFn, `${FAQ_RELATIONSHIP_BASE}/${id}`),

	/**
	 * Reorders FAQ relationships by updating their display positions.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param data - Reorder payload with items and positions.
	 */
	reorder: (fetchFn: typeof fetch, data: FaqRelationshipReorderDto): Promise<void> =>
		patch(fetchFn, `${FAQ_RELATIONSHIP_BASE}/reorder`, data),

	/**
	 * Retrieves a single FAQ relationship by its ID.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param id - FAQ relationship ID.
	 */
	findById: (fetchFn: typeof fetch, id: string): Promise<FaqRelationship> =>
		get<FaqRelationship>(fetchFn, `${FAQ_RELATIONSHIP_BASE}/${id}`),

	/**
	 * Queries FAQ relationships using criteria-based filtering and pagination.
	 * @param fetchFn - SvelteKit `fetch`.
	 * @param criteria - Optional filter, sort, and pagination parameters.
	 */
	findByCriteria: (
		fetchFn: typeof fetch,
		criteria?: FaqRelationshipCriteria
	): Promise<CriteriaResult<FaqRelationship>> =>
		getWithParams<CriteriaResult<FaqRelationship>>(fetchFn, FAQ_RELATIONSHIP_BASE, criteria)
};
