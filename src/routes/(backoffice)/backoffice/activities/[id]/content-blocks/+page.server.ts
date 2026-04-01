/**
 * Server load for the content tab.
 * Includes content blocks (with auto-add support), multimedia, and FAQs.
 */
import { CONTENT_BLOCK_REQUEST } from '$core/content-blocks/requests';
import { MEDIA_REQUEST } from '$core/multimedia/requests';
import { FAQ_REQUEST, FAQ_RELATIONSHIP_REQUEST } from '$core/faqs/requests';
import { FaqRelationshipEntityType } from '$core/faqs/enums';
import { FaqStatus } from '$core/faqs/enums';
import type { ContentBlock } from '$core/content-blocks/types';
import type { ActivityImage } from '$core/activities/types';
import type { PageServerLoad } from './$types';

/** ActivityImage enriched with resolved media metadata. */
export type EnrichedActivityImage = ActivityImage & {
	title: string;
	altText: string;
};

export const load: PageServerLoad = async ({ parent, fetch, url }) => {
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

	let availableFaqs: { id: string; question: string }[] = [];
	let activityFaqs: { relationshipId: string; faqId: string; question: string }[] = [];

	try {
		const [faqsResponse, faqRelationshipsResponse] = await Promise.all([
			FAQ_REQUEST.findByCriteria(fetch, { status: FaqStatus.PUBLISHED, limit: 200 }),
			FAQ_RELATIONSHIP_REQUEST.findByCriteria(fetch, {
				entityId: activity.id,
				entityType: FaqRelationshipEntityType.ACTIVITY,
				limit: 200
			})
		]);

		availableFaqs = faqsResponse.data.map((f) => ({ id: f.id, question: f.question }));
		const faqMap = new Map(availableFaqs.map((f) => [f.id, f.question]));
		activityFaqs = (faqRelationshipsResponse.data ?? []).map((rel) => ({
			relationshipId: rel.id,
			faqId: rel.faqId,
			question: faqMap.get(rel.faqId) ?? rel.faqId
		}));
	} catch {
		// FAQ endpoints may not be deployed yet — degrade gracefully
	}

	return {
		contentBlocks: activity.contentBlocks ?? [],
		pendingContentBlock,
		images,
		availableFaqs,
		activityFaqs
	};
};
