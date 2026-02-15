/**
 * @module destinations/routes
 * @description Backoffice route definitions for the Destinations resource.
 * Co-located with the API module to keep navigation and data-access context together.
 */

import { backoffice } from '$lib/config/routes/core';

/** Backoffice URL helpers for destination pages. */
export const DESTINATION_ROUTES = {
	/** Destinations list page. */
	list: backoffice('destinations'),
	/** Destination creation page. */
	create: backoffice('destinations/create'),
	/**
	 * Destination detail page.
	 * @param slug - URL-friendly destination identifier.
	 */
	detail: (slug: string) => backoffice('destinations', slug),
	/**
	 * Destination edit page.
	 * @param slug - URL-friendly destination identifier.
	 */
	edit: (slug: string) => backoffice('destinations', slug, 'edit'),
	/**
	 * Destination delete confirmation page.
	 * @param slug - URL-friendly destination identifier.
	 */
	delete: (slug: string) => backoffice('destinations', slug, 'delete')
} as const;
