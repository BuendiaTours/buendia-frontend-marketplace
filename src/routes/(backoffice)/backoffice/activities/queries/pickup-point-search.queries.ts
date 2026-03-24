/**
 * Client-side query functions for async pickup point search.
 * Used by the option pickup tab to find and link pickup points.
 */
import type { SearchResult } from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';
import { PICKUP_POINT_REQUEST } from '$core/pickup-points/requests';
import type { PickupPoint } from '$core/pickup-points/types';

export type PickupPointSearchResult = SearchResult & {
	address: string | null;
	city: string | null;
};

/** Searches pickup points by name, returning results formatted for FormAsyncSearch. */
export async function searchPickupPoints(query: string): Promise<PickupPointSearchResult[]> {
	try {
		const result = await PICKUP_POINT_REQUEST.findByCriteria(fetch, {
			name: query,
			limit: 10
		});
		return (result.data ?? []).map((pp) => ({
			value: pp.id,
			label: pp.name,
			subtitle: [pp.address, pp.city].filter(Boolean).join(', ') || undefined,
			address: pp.address,
			city: pp.city
		}));
	} catch {
		return [];
	}
}
