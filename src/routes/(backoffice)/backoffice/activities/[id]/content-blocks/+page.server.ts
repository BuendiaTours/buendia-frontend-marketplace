/**
 * Server load for the content blocks tab.
 * Handles auto-add when returning from content block creation.
 */
import { CONTENT_BLOCK_REQUEST } from '$core/content-blocks/requests';
import type { ContentBlock } from '$core/content-blocks/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, url }) => {
	const { activity } = await parent();

	const addContentBlockId = url.searchParams.get('addContentBlockId');
	let pendingContentBlock: ContentBlock | null = null;

	if (addContentBlockId) {
		try {
			pendingContentBlock = await CONTENT_BLOCK_REQUEST.findById(fetch, addContentBlockId);
		} catch {
			// Not found yet (CQRS) — silently ignore
		}
	}

	return {
		contentBlocks: activity.contentBlocks ?? [],
		pendingContentBlock
	};
};
