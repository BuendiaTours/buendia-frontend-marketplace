/**
 * Client-side query functions for async location search in activities.
 * Used by the locations accordion to find and link locations.
 */
import type { SearchResult } from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';
import { LOCATION_KIND_OPTIONS } from '$lib/labels/locations';
import { LOCATION_REQUEST } from '$core/locations/requests';

/** Searches locations by name, returning results formatted for FormAsyncSearch. */
export async function searchLocations(query: string): Promise<SearchResult[]> {
	try {
		const result = await LOCATION_REQUEST.findByCriteria(fetch, {
			search_text: query,
			limit: 10
		});
		return (result.data ?? []).map((loc) => ({
			value: loc.id,
			label: loc.name,
			subtitle: LOCATION_KIND_OPTIONS.find((k) => k.id === loc.kind)?.name || loc.kind
		}));
	} catch {
		return [];
	}
}
