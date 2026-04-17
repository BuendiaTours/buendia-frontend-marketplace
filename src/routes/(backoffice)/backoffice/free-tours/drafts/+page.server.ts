/**
 * Server load for /free-tours/drafts.
 * Lists FREE_TOUR activities that still need placement into a free tour:
 * - `DRAFT`: being edited, not ready yet.
 * - `PENDING_GROUP`: edited and ready, waiting to be assigned to a free tour
 *   (either creating a new one or joining an existing one).
 */
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ACTIVITY_REQUEST } from '$core/activities/requests';
import { ActivityKind, ActivityStatus } from '$core/activities/enums';
import type { ActivityCriteria } from '$core/activities/types';
import { ApiError } from '$core/_shared/errors';
import { buildPagination } from '$core/_shared/params';
import { generateBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';

const PAGE_SIZE = 20;

export const load: PageServerLoad = async ({ fetch, url }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	const q = url.searchParams.get('q') || undefined;

	try {
		const response = await ACTIVITY_REQUEST.findByCriteria(fetch, {
			kind: ActivityKind.FREE_TOUR,
			statuses: [ActivityStatus.DRAFT, ActivityStatus.PENDING_GROUP],
			search_text: q,
			limit: PAGE_SIZE,
			skip: (page - 1) * PAGE_SIZE
		} as ActivityCriteria);

		return {
			items: response.data || [],
			pagination: buildPagination(response.total, page, PAGE_SIZE),
			filters: { q, page },
			breadcrumbs: generateBreadcrumbs(url.pathname)
		};
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status || 500);
		}
		throw error(503);
	}
};
