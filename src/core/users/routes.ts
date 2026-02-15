/**
 * @module users/routes
 * @description Backoffice route definitions for the Users resource.
 * Co-located with the API module to keep navigation and data-access context together.
 */

import { backoffice } from '$lib/config/routes/core';

/** Backoffice URL helpers for user pages. */
export const USER_ROUTES = {
	/** Users list page. */
	list: backoffice('users'),
	/** User creation page. */
	create: backoffice('users/create'),
	/**
	 * User detail page.
	 * @param id - User ID.
	 */
	detail: (id: string) => backoffice('users', id),
	/**
	 * User edit page.
	 * @param id - User ID.
	 */
	edit: (id: string) => backoffice('users', id, 'edit'),
	/**
	 * User delete confirmation page.
	 * @param id - User ID.
	 */
	delete: (id: string) => backoffice('users', id, 'delete')
} as const;
