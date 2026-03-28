/**
 * Client-side query functions for async content block search in activities.
 * Used by FormAsyncSearch to find content blocks to link.
 */
import type { SearchResult } from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';
import { CONTENT_BLOCK_REQUEST } from '$core/content-blocks/requests';

/** Searches content blocks by title. */
export async function searchContentBlocks(query: string): Promise<SearchResult[]> {
	try {
		const result = await CONTENT_BLOCK_REQUEST.findByCriteria(fetch, {
			searchText: query,
			limit: 10
		});
		return (result.data ?? []).map((cb) => ({
			value: cb.id,
			label: cb.title,
			subtitle: cb.kind
		}));
	} catch {
		return [];
	}
}
