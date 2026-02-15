/**
 * @module _shared/params
 * @description URL and pagination parameter utilities.
 * Bridges the gap between the UI's page-based model and the backend's
 * skip/limit model, and provides helpers for building query-string URLs.
 */

import type { Pagination } from '$lib/types';

/** Primitive values accepted as URL search parameters. */
type ParamValue = string | number | boolean | undefined;

/**
 * Appends query parameters to an API path, producing a complete URL string.
 * - `undefined` values are silently omitted.
 * - Array values generate multiple entries for the same key (`key=a&key=b`).
 *
 * @param path - Base API path (e.g. `/activities`).
 * @param params - Key-value map of query parameters.
 * @returns The path with a query string appended (or unchanged if no params).
 */
export function buildEndpointUrl(
	path: string,
	params?: Record<string, ParamValue | ParamValue[]>
): string {
	if (!params) return path;

	const searchParams = new URLSearchParams();
	Object.entries(params).forEach(([key, value]) => {
		if (value === undefined) return;
		if (Array.isArray(value)) {
			value.forEach((v) => {
				if (v !== undefined) searchParams.append(key, String(v));
			});
		} else {
			searchParams.set(key, String(value));
		}
	});

	const query = searchParams.toString();
	return query ? `${path}?${query}` : path;
}

/**
 * Converts UI pagination params (`page` / `pageSize`) to the backend's
 * `skip` / `limit` format. Also normalises `order` to uppercase.
 * All other parameters are passed through untouched.
 *
 * @template T - Shape of the incoming params object.
 * @param params - Query parameters that may contain `page` and `pageSize`.
 * @returns A new object with `skip` and `limit` instead of `page` and `pageSize`.
 */
export function toSkipLimit<T extends Record<string, unknown>>(
	params?: T
): Omit<T, 'page' | 'pageSize'> & { skip?: number; limit?: number } {
	if (!params) return {} as Omit<T, 'page' | 'pageSize'>;

	const { page, pageSize, order, ...rest } = params as Record<string, unknown>;

	const result: Record<string, unknown> = { ...rest };

	if (typeof pageSize === 'number') {
		result.limit = pageSize;
	}

	if (typeof page === 'number' && typeof pageSize === 'number') {
		result.skip = (page - 1) * pageSize;
	}

	if (typeof order === 'string') {
		result.order = order.toUpperCase();
	}

	return result as Omit<T, 'page' | 'pageSize'> & { skip?: number; limit?: number };
}

/**
 * Builds a {@link Pagination} object for the UI from the API's total count
 * and the page/pageSize the user requested.
 *
 * @param total - Total number of records returned by the API.
 * @param page - Current page number (1-indexed, defaults to 1).
 * @param pageSize - Number of records per page (defaults to 10).
 * @returns A pagination descriptor with computed `totalPages`.
 */
export function buildPagination(total: number, page = 1, pageSize = 10): Pagination {
	return {
		page,
		pageSize,
		total,
		totalPages: Math.ceil(total / pageSize)
	};
}
