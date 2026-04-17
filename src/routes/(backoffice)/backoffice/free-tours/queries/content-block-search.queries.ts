/**
 * Client-side query to search content blocks for free tour linking.
 */
import type { SearchResult } from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';
import { CONTENT_BLOCK_REQUEST } from '$core/content-blocks/requests';

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
