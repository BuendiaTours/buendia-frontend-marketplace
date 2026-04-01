/**
 * @module routes/backoffice/faqs
 * @description Backoffice route definitions for the FAQs resource.
 */

import { backoffice } from '../core';

/** Backoffice URL helpers for FAQ pages. */
export const FAQ_ROUTES = {
	/** FAQs list page. */
	list: backoffice('faqs'),
	/** FAQ creation page. */
	create: backoffice('faqs/create'),
	/**
	 * FAQ edit page.
	 * @param id - FAQ identifier.
	 */
	edit: (id: string) => backoffice('faqs', id, 'edit')
} as const;
