/**
 * @module activities/routes
 * @description Backoffice route definitions for the Activities resource.
 * Co-located with the API module to keep navigation and data-access context together.
 */

import { backoffice } from '$lib/config/routes/core';

/** Backoffice URL helpers for activity pages. */
export const ACTIVITY_ROUTES = {
	/** Activities list page. */
	list: backoffice('activities'),
	/** Activity creation page. */
	create: backoffice('activities/create'),
	/**
	 * Activity detail page.
	 * @param slug - URL-friendly activity identifier.
	 */
	detail: (slug: string) => backoffice('activities', slug),
	/**
	 * Activity edit page.
	 * @param slug - URL-friendly activity identifier.
	 */
	edit: (slug: string) => backoffice('activities', slug, 'edit'),
	/**
	 * Activity delete confirmation page.
	 * @param slug - URL-friendly activity identifier.
	 */
	delete: (slug: string) => backoffice('activities', slug, 'delete')
} as const;
