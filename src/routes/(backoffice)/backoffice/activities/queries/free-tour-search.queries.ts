/**
 * Client-side query to search free tour aggregations by title.
 * Used by the "Join existing free tour" picker on an activity edit page to
 * pick a FreeTour aggregation to add the current activity into as a new entry.
 */
import { FREE_TOUR_REQUEST } from '$core/free-tours/requests';
import type { SearchResult } from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';

export async function searchFreeTours(query: string): Promise<SearchResult[]> {
	try {
		const result = await FREE_TOUR_REQUEST.findByCriteria(fetch, {
			searchText: query || undefined,
			limit: 20
		});
		return result.data.map((ft) => ({ value: ft.id, label: ft.title }));
	} catch {
		return [];
	}
}
