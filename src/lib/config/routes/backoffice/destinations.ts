/**
 * @module routes/backoffice/destinations
 * @description Backoffice route definitions for the Destinations resource.
 */

import { backoffice } from '../core';

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
