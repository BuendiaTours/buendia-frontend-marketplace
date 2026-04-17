/**
 * @module routes/backoffice/freeTours
 * @description Backoffice route definitions for the Free Tours resource.
 */

import { backoffice } from '../core';

/** Backoffice URL helpers for free tour pages. */
export const FREE_TOUR_ROUTES = {
	/** Free tours list page (aggregations). */
	list: backoffice('free-tours'),
	/** FREE_TOUR activities in DRAFT status (not yet promoted to an aggregation). */
	drafts: backoffice('free-tours/drafts'),
	/** Free tour creation page. */
	create: backoffice('free-tours/create'),
	/**
	 * Free tour edit page (General tab).
	 * @param id - Free tour identifier.
	 */
	edit: (id: string) => backoffice('free-tours', id, 'edit'),
	/**
	 * Free tour entries page (Activities tab).
	 * @param id - Free tour identifier.
	 */
	entries: (id: string) => backoffice('free-tours', id, 'entries'),
	/**
	 * Free tour content page (Content tab).
	 * @param id - Free tour identifier.
	 */
	content: (id: string) => backoffice('free-tours', id, 'content')
} as const;
