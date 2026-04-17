/**
 * Client-side query to search FREE_TOUR activities that are ready to be linked
 * to a free tour aggregation (status=PENDING_GROUP). Used by the entries
 * accordion to add new entries to an existing aggregation.
 */
import { ActivityKind, ActivityStatus } from '$core/activities/enums';
import { ACTIVITY_REQUEST } from '$core/activities/requests';
import type { SearchResult } from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';

export async function searchFreeTourActivities(query: string): Promise<SearchResult[]> {
	try {
		const result = await ACTIVITY_REQUEST.findByCriteria(fetch, {
			kind: ActivityKind.FREE_TOUR,
			statuses: [ActivityStatus.PENDING_GROUP],
			search_text: query,
			limit: 20
		});
		return result.data.map((a) => ({ value: a.id, label: a.title }));
	} catch {
		return [];
	}
}
