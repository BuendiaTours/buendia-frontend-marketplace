/**
 * Client-side query to search FREE_TOUR activities.
 * Used by the entries accordion to find eligible activities.
 */
import { ACTIVITY_REQUEST } from '$core/activities/requests';
import { ActivityKind } from '$core/activities/enums';
import type { SearchResult } from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';

export async function searchFreeTourActivities(query: string): Promise<SearchResult[]> {
	try {
		const result = await ACTIVITY_REQUEST.findByCriteria(fetch, {
			kind: ActivityKind.FREE_TOUR,
			search_text: query,
			limit: 20
		});
		return result.data.map((a) => ({ value: a.id, label: a.title }));
	} catch {
		return [];
	}
}
