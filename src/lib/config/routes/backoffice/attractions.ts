/**
 * @module routes/backoffice/attractions
 * @description Backoffice route definitions for the Attractions resource.
 */

import { backoffice } from '../core';

/** Backoffice URL helpers for attraction pages. */
export const ATTRACTION_ROUTES = {
	/** Attractions list page. */
	list: backoffice('attractions'),
	/** Attraction creation page. */
	create: backoffice('attractions/create'),
	/**
	 * Attraction edit page.
	 * @param id - Attraction identifier.
	 */
	edit: (id: string) => backoffice('attractions', id, 'edit')
} as const;
