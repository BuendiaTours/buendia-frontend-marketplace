/**
 * Server load for the content tab.
 * Includes content blocks (with auto-add support), multimedia, meals, and addons.
 */
import { CONTENT_BLOCK_REQUEST } from '$core/content-blocks/requests';
import { MEDIA_REQUEST } from '$core/multimedia/requests';
import type { ContentBlock } from '$core/content-blocks/types';
import type { ActivityImage } from '$core/activities/types';
import type { PageServerLoad } from './$types';

/** ActivityImage enriched with resolved media metadata. */
export type EnrichedActivityImage = ActivityImage & {
	title: string;
	altText: string;
};

export const load: PageServerLoad = async ({ parent, fetch, url }) => {
	const { activity, addons } = await parent();

	const addContentBlockId = url.searchParams.get('addContentBlockId');
	let pendingContentBlock: ContentBlock | null = null;

	if (addContentBlockId) {
		try {
			pendingContentBlock = await CONTENT_BLOCK_REQUEST.findById(fetch, addContentBlockId);
		} catch {
			// Not found yet (CQRS) — silently ignore
		}
	}

	const rawImages = activity.images ?? [];
	const images: EnrichedActivityImage[] = await Promise.all(
		rawImages.map(async (img) => {
			try {
				const media = await MEDIA_REQUEST.findById(fetch, img.mediaId);
				return { ...img, title: media.title || '', altText: media.altText || '' };
			} catch {
				return { ...img, title: '', altText: '' };
			}
		})
	);

	return {
		contentBlocks: activity.contentBlocks ?? [],
		pendingContentBlock,
		images,
		meals: activity.meals ?? [],
		addons: addons ?? []
	};
};
