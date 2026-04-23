/**
 * Server load for the distributive content tab.
 * Includes content blocks (with auto-add support), multimedia, and FAQs.
 */
import { CONTENT_BLOCK_REQUEST } from '$core/content-blocks/requests';
import { MEDIA_REQUEST } from '$core/multimedia/requests';
import { FAQ_REQUEST, FAQ_RELATIONSHIP_REQUEST } from '$core/faqs/requests';
import { FaqRelationshipEntityType, FaqScopeFilter, FaqStatus } from '$core/faqs/enums';
import type { ContentBlock } from '$core/content-blocks/types';
import type { DistributiveImage } from '$core/distributives/types';
import type { PageServerLoad } from './$types';

/** DistributiveImage enriched with fresh media metadata. */
export type EnrichedDistributiveImage = DistributiveImage;

export const load: PageServerLoad = async ({ parent, fetch, url }) => {
	const { distributive } = await parent();

	const addContentBlockId = url.searchParams.get('addContentBlockId');
	let pendingContentBlock: ContentBlock | null = null;

	if (addContentBlockId) {
		try {
			pendingContentBlock = await CONTENT_BLOCK_REQUEST.findById(fetch, addContentBlockId);
		} catch {
			// Not found yet (CQRS) — silently ignore
		}
	}

	const rawImages = distributive.images ?? [];
	const images: EnrichedDistributiveImage[] = await Promise.all(
		rawImages.map(async (img) => {
			try {
				const media = await MEDIA_REQUEST.findById(fetch, img.mediaId);
				return { ...img, title: media.title || '', altText: media.altText || '' };
			} catch {
				return { ...img, title: img.title || '', altText: img.altText || '' };
			}
		})
	);

	const addFaqId = url.searchParams.get('addFaqId');
	let pendingFaq: { id: string; question: string } | null = null;

	if (addFaqId) {
		try {
			const faq = await FAQ_REQUEST.findById(fetch, addFaqId);
			pendingFaq = { id: faq.id, question: faq.question };
		} catch {
			// Not found yet (CQRS) — silently ignore
		}
	}

	let availableFaqs: { id: string; question: string }[] = [];
	let distributiveFaqs: { relationshipId: string; faqId: string; question: string }[] = [];

	try {
		const [faqsResponse, faqRelationshipsResponse] = await Promise.all([
			FAQ_REQUEST.findByCriteria(fetch, {
				status: FaqStatus.PUBLISHED,
				scope: FaqScopeFilter.GLOBAL,
				limit: 200
			}),
			FAQ_RELATIONSHIP_REQUEST.findByCriteria(fetch, {
				entityId: distributive.id,
				entityType: FaqRelationshipEntityType.DISTRIBUTIVE,
				limit: 200
			})
		]);

		availableFaqs = faqsResponse.data.map((f) => ({ id: f.id, question: f.question }));
		const faqMap = new Map(availableFaqs.map((f) => [f.id, f.question]));
		const relationships = faqRelationshipsResponse.data ?? [];

		// Already-linked FAQs may be distributive-scoped (not in the GLOBAL selector list),
		// so fall back to findById when the question isn't cached.
		distributiveFaqs = await Promise.all(
			relationships.map(async (rel) => {
				const cached = faqMap.get(rel.faqId);
				if (cached) {
					return { relationshipId: rel.id, faqId: rel.faqId, question: cached };
				}
				try {
					const faq = await FAQ_REQUEST.findById(fetch, rel.faqId);
					return { relationshipId: rel.id, faqId: faq.id, question: faq.question };
				} catch {
					return { relationshipId: rel.id, faqId: rel.faqId, question: rel.faqId };
				}
			})
		);
	} catch {
		// FAQ endpoints may not be deployed yet — degrade gracefully
	}

	return {
		contentBlocks: distributive.contentBlocks ?? [],
		pendingContentBlock,
		images,
		availableFaqs,
		distributiveFaqs,
		pendingFaq
	};
};
