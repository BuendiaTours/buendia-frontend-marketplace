/**
 * @module attractions/routes
 * @description Backoffice route definitions for the Attractions resource.
 * Co-located with the API module to keep navigation and data-access context together.
 */

import { backoffice } from '$lib/config/routes/core';

/** Backoffice URL helpers for attraction pages. */
export const ATTRACTION_ROUTES = {
	/** Attractions list page. */
	list: backoffice('attractions'),
	/** Attraction creation page. */
	create: backoffice('attractions/create'),
	/**
	 * Attraction detail page.
	 * @param slug - URL-friendly attraction identifier.
	 */
	detail: (slug: string) => backoffice('attractions', slug),
	/**
	 * Attraction edit page.
	 * @param slug - URL-friendly attraction identifier.
	 */
	edit: (slug: string) => backoffice('attractions', slug, 'edit'),
	/**
	 * Attraction delete confirmation page.
	 * @param slug - URL-friendly attraction identifier.
	 */
	delete: (slug: string) => backoffice('attractions', slug, 'delete')
} as const;
