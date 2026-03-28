/**
 * @module routes/backoffice/multimedia
 * @description Backoffice route definitions for the Multimedia resource.
 */

import { backoffice } from '../core';

/** Backoffice URL helpers for multimedia pages. */
export const MULTIMEDIA_ROUTES = {
	/** Multimedia list page. */
	list: backoffice('multimedia'),
	/**
	 * Multimedia edit page.
	 * @param id - Media identifier.
	 */
	edit: (id: string) => backoffice('multimedia', id, 'edit')
} as const;
