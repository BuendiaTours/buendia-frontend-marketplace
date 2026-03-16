/**
 * Client-side query functions for async attraction search in activities.
 * Used by the attractions accordion to find and link attractions.
 */
import type { SearchResult } from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';
import { ATTRACTION_REQUEST } from '$core/attractions/requests';

/** Searches attractions by name, returning results formatted for FormAsyncSearch. */
export async function searchAttractions(query: string): Promise<SearchResult[]> {
	try {
		const result = await ATTRACTION_REQUEST.findByCriteria(fetch, {
			search_text: query,
			limit: 10
		});
		return (result.data ?? []).map((a) => ({
			value: a.id,
			label: a.name
		}));
	} catch {
		return [];
	}
}
