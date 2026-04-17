/**
 * Server load for the free tour content tab.
 * Includes content blocks (with auto-add support) and multimedia (enriched images).
 */
import { MEDIA_REQUEST } from '$core/multimedia/requests';
import { CONTENT_BLOCK_REQUEST } from '$core/content-blocks/requests';
import type { ContentBlock } from '$core/content-blocks/types';
import type { FreeTourImage } from '$core/free-tours/types';
import type { PageServerLoad } from './$types';

/** FreeTourImage enriched with resolved media metadata. */
export type EnrichedFreeTourImage = FreeTourImage & {
	title: string;
	altText: string;
};

export const load: PageServerLoad = async ({ parent, fetch, url }) => {
	const { freeTour } = await parent();

	// ── Auto-add content block ───────────────────────
	const addContentBlockId = url.searchParams.get('addContentBlockId');
	let pendingContentBlock: ContentBlock | null = null;

	if (addContentBlockId) {
		try {
			pendingContentBlock = await CONTENT_BLOCK_REQUEST.findById(fetch, addContentBlockId);
		} catch {
			// Not found yet (CQRS)
		}
	}

	// ── Enrich images with media metadata ────────────
	const rawImages = freeTour.images ?? [];
	const images: EnrichedFreeTourImage[] = await Promise.all(
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
		contentBlocks: freeTour.contentBlocks ?? [],
		pendingContentBlock,
		images
	};
};
