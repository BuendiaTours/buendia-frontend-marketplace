/**
 * Server load for the multimedia tab.
 * Returns images from the activity projection enriched with title/altText from Media.
 */
import { MEDIA_REQUEST } from '$core/multimedia/requests';
import type { ActivityImage } from '$core/activities/types';
import type { PageServerLoad } from './$types';

/** ActivityImage enriched with resolved media metadata. */
export type EnrichedActivityImage = ActivityImage & {
	title: string;
	altText: string;
};

export const load: PageServerLoad = async ({ parent, fetch }) => {
	const { activity } = await parent();
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

	return { images };
};
