/**
 * @module routes/backoffice/tags
 * @description Backoffice route definitions for the Tags resource.
 */

import { backoffice } from '../core';

/** Backoffice URL helpers for tag pages. */
export const TAG_ROUTES = {
	/** Tags list page. */
	list: backoffice('tags'),
	/** Tag creation page. */
	create: backoffice('tags/create'),
	/**
	 * Tag edit page.
	 * @param id - Tag identifier.
	 */
	edit: (id: string) => backoffice('tags', id, 'edit')
} as const;
