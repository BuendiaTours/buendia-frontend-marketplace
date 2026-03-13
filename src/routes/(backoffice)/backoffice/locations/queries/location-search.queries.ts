/**
 * Client-side search queries for the location form.
 * Maps API responses to SearchResult format for FormAsyncSearch.
 */

import type { SearchResult } from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';
import type { Location } from '$lib/types';
import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { LOCATION_KIND_OPTIONS } from '$lib/labels/locations';

export async function searchLocations(query: string): Promise<SearchResult[]> {
	try {
		const params = new URLSearchParams({ query, limit: '10' });
		const res = await fetch(`${PUBLIC_API_BASE_URL}/locations?${params.toString()}`);
		if (!res.ok) return [];
		const data = await res.json();
		return (data.data ?? []).map((loc: Location) => ({
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
		const res = await fetch(`${PUBLIC_API_BASE_URL}/locations/${id}`);
		if (!res.ok) return undefined;
		const loc: Location = await res.json();
		return { value: loc.id, label: loc.name };
	} catch {
		return undefined;
	}
}
