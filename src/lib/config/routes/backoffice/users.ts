/**
 * @module routes/backoffice/users
 * @description Backoffice route definitions for the Users resource.
 */

import { backoffice } from '../core';

/** Backoffice URL helpers for user pages. */
export const USER_ROUTES = {
	/** Users list page. */
	list: backoffice('users'),
	/** User creation page. */
	create: backoffice('users/create'),
	/**
	 * User edit page.
	 * @param id - User identifier.
	 */
	edit: (id: string) => backoffice('users', id, 'edit')
} as const;
