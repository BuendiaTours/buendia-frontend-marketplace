import type { SearchResult } from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';
import { LOCATION_KIND_OPTIONS } from '$lib/labels/locations';
import { LOCATION_REQUEST } from '$core/locations/requests';

export async function searchLocations(query: string): Promise<SearchResult[]> {
	try {
		const result = await LOCATION_REQUEST.findByCriteria(fetch, { query, limit: 10 });
		return (result.data ?? []).map((loc) => ({
			value: loc.id,
			label: loc.name,
			subtitle: LOCATION_KIND_OPTIONS.find((k) => k.id === loc.kind)?.name || loc.kind
		}));
	} catch {
		return [];
	}
}

export async function loadLocationById(id: string): Promise<SearchResult | undefined> {
	try {
		const loc = await LOCATION_REQUEST.findById(fetch, id);
		return { value: loc.id, label: loc.name };
	} catch {
		return undefined;
	}
}
