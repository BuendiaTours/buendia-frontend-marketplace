/**
 * Client-side query to search FREE_TOUR activities that are ready to be linked
 * to a free tour aggregation (status=PENDING_GROUP). Used by the entries
 * accordion to add new entries to an existing aggregation.
 *
 * The backend is asked for PENDING_GROUP only, and we re-enforce that filter
 * client-side. The status label is surfaced as a subtitle in the search
 * dropdown so the admin sees at a glance why an activity is (or isn't)
 * available here.
 */
import { ActivityKind, ActivityStatus } from '$core/activities/enums';
import { ACTIVITY_REQUEST } from '$core/activities/requests';
import { ACTIVITY_STATUS_OPTIONS } from '$lib/labels/activities';
import type { SearchResult } from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';

function statusLabel(status: ActivityStatus): string {
	return ACTIVITY_STATUS_OPTIONS.find((o) => o.id === status)?.name ?? status;
}

export async function searchFreeTourActivities(query: string): Promise<SearchResult[]> {
	try {
		const result = await ACTIVITY_REQUEST.findByCriteria(fetch, {
			kind: ActivityKind.FREE_TOUR,
			statuses: [ActivityStatus.PENDING_GROUP],
			search_text: query,
			limit: 20
		});
		return result.data
			.filter((a) => a.status === ActivityStatus.PENDING_GROUP)
			.map((a) => ({
				value: a.id,
				label: a.title,
				subtitle: statusLabel(a.status as ActivityStatus)
			}));
	} catch {
		return [];
	}
}
