import type { Pagination } from '$lib/types';

type ParamValue = string | number | boolean | undefined;

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
 * Converts page/pageSize params to skip/limit for the API.
 * Also uppercases `order` (asc → ASC, desc → DESC).
 * Passes through all other params unchanged.
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
 * Builds a Pagination object for the UI from the API's total count
 * and the page/pageSize the user requested.
 */
export function buildPagination(total: number, page = 1, pageSize = 10): Pagination {
	return {
		page,
		pageSize,
		total,
		totalPages: Math.ceil(total / pageSize)
	};
}
