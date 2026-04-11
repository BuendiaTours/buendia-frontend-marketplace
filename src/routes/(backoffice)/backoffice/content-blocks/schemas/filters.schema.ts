import type { FiltersSchema } from '$lib/utils/filters';
import { createOrderField, createSortField } from '$lib/utils/filters';
import type { CriteriaSortOption } from '$core/_shared/enums';
import { ContentBlockKind, ContentBlockScopeFilter } from '$core/content-blocks/enums';

export type ContentBlocksFilters = {
	page?: number;
	pageSize?: number;
	sort?: 'TITLE' | 'KIND' | 'TARGET';
	order?: CriteriaSortOption;
	q?: string;
	kind?: ContentBlockKind;
	scope?: ContentBlockScopeFilter;
};

export const contentBlocksFiltersSchema: FiltersSchema<ContentBlocksFilters> = {
	fields: {
		page: {
			parse: (raw) => {
				if (!raw) return undefined;
				const num = parseInt(raw, 10);
				return num > 0 ? num : undefined;
			},
			serialize: (value, out) => {
				if (value !== undefined) {
					out.set('page', String(value));
				} else {
					out.delete('page');
				}
			},
			resetPageOnChange: false
		},
		pageSize: {
			parse: (raw) => {
				if (!raw) return undefined;
				const num = parseInt(raw, 10);
				return num > 0 ? num : undefined;
			},
			serialize: (value, out) => {
				if (value !== undefined) {
					out.set('pageSize', String(value));
				} else {
					out.delete('pageSize');
				}
			},
			resetPageOnChange: false
		},
		sort: createSortField(['TITLE', 'KIND', 'TARGET'] as const),
		order: createOrderField(),
		q: {
			parse: (raw) => raw || undefined,
			serialize: (value, out) => {
				if (value) {
					out.set('q', value);
				} else {
					out.delete('q');
				}
			},
			resetPageOnChange: true
		},
		kind: {
			parse: (raw) => {
				if (Object.values(ContentBlockKind).includes(raw as ContentBlockKind)) {
					return raw as ContentBlockKind;
				}
				return undefined;
			},
			serialize: (value, out) => {
				if (value) {
					out.set('kind', value);
				} else {
					out.delete('kind');
				}
			},
			resetPageOnChange: true
		},
		scope: {
			parse: (raw) => {
				if (Object.values(ContentBlockScopeFilter).includes(raw as ContentBlockScopeFilter)) {
					return raw as ContentBlockScopeFilter;
				}
				return undefined;
			},
			serialize: (value, out) => {
				if (value) {
					out.set('scope', value);
				} else {
					out.delete('scope');
				}
			},
			resetPageOnChange: true
		}
	}
};
