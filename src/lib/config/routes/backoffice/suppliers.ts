/**
 * @module routes/backoffice/suppliers
 * @description Backoffice route definitions for the Suppliers resource.
 */

import { backoffice } from '../core';

/** Backoffice URL helpers for supplier pages. */
export const SUPPLIER_ROUTES = {
	/** Suppliers list page. */
	list: backoffice('suppliers'),
	/** Supplier creation page. */
	create: backoffice('suppliers/create'),
	/**
	 * Supplier edit page.
	 * @param id - Supplier identifier.
	 */
	edit: (id: string) => backoffice('suppliers', id, 'edit')
} as const;
