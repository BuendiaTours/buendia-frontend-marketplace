/**
 * @module routes/backoffice/freeTours
 * @description Backoffice route definitions for the Free Tours resource.
 */

import { backoffice } from '../core';

/** Backoffice URL helpers for free tour pages. */
export const FREE_TOUR_ROUTES = {
	/** Free tours list page. */
	list: backoffice('free-tours'),
	/** Free tour creation page. */
	create: backoffice('free-tours/create'),
	/**
	 * Free tour edit page.
	 * @param id - Free tour identifier.
	 */
	edit: (id: string) => backoffice('free-tours', id, 'edit')
} as const;
