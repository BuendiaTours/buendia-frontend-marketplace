/**
 * Client-side query functions for async media search in activities.
 * Used by FormAsyncSearch to find media assets to link.
 */
import type { SearchResult } from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';
import { MEDIA_REQUEST } from '$core/multimedia/requests';
import { MediaStatus, MediaVariantPreset } from '$core/multimedia/enums';
import type { Media } from '$core/multimedia/types';

/** Returns the best available thumbnail URL for a media asset. */
function getThumbnailUrl(media: Media): string | undefined {
	const thumb = media.variants?.find((v) => v.preset === MediaVariantPreset.THUMBNAIL);
	if (thumb?.url) return thumb.url;
	return media.variants?.[0]?.url;
}

/** Searches media assets by title, returning only READY images. */
export async function searchMedia(query: string): Promise<SearchResult[]> {
	try {
		const result = await MEDIA_REQUEST.findByCriteria(fetch, {
			search_text: query,
			status: MediaStatus.READY,
			limit: 10
		});
		return (result.data ?? []).map((media) => ({
			value: media.id,
			label: media.title || media.id,
			subtitle: `${media.originalWidth}×${media.originalHeight}`,
			image: getThumbnailUrl(media)
		}));
	} catch {
		return [];
	}
}
