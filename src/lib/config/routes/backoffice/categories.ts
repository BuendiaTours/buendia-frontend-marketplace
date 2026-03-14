/**
 * @module routes/backoffice/categories
 * @description Backoffice route definitions for the Categories resource.
 */

import { backoffice } from '../core';

/** Backoffice URL helpers for category pages. */
export const CATEGORY_ROUTES = {
	/** Categories list page. */
	list: backoffice('categories'),
	/** Category creation page. */
	create: backoffice('categories/create'),
	/**
	 * Category edit page.
	 * @param id - Category identifier.
	 */
	edit: (id: string) => backoffice('categories', id, 'edit')
} as const;
