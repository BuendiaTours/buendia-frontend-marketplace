/**
 * @module routes/backoffice/distributives
 * @description Backoffice route definitions for the Distributives resource.
 */

import { backoffice } from '../core';

/** Backoffice URL helpers for distributive pages. */
export const DISTRIBUTIVE_ROUTES = {
	/** Distributives list page. */
	list: backoffice('distributives'),
	/** Distributive creation page. */
	create: backoffice('distributives/create'),
	/**
	 * Distributive edit page (General tab).
	 * @param id - Distributive identifier.
	 */
	edit: (id: string) => backoffice('distributives', id, 'edit'),
	/**
	 * Distributive content tab (content blocks, multimedia, FAQs).
	 * @param id - Distributive identifier.
	 */
	contentBlocks: (id: string) => backoffice('distributives', id, 'content-blocks')
} as const;
