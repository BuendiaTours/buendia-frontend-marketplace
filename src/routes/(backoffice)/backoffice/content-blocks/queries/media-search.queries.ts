/**
 * Client-side query functions for async media search in content blocks.
 * Used by FormAsyncSearch to find existing media assets.
 */
import type { SearchResult } from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';
import { MEDIA_REQUEST } from '$core/multimedia/requests';

/** Searches media by title, returning results formatted for FormAsyncSearch. */
export async function searchMedia(query: string): Promise<SearchResult[]> {
	try {
		const result = await MEDIA_REQUEST.findByCriteria(fetch, {
			search_text: query,
			limit: 10
		});
		return (result.data ?? []).map((m) => {
			const thumb = m.variants?.find((v) => v.preset === 'THUMBNAIL')?.url ?? m.variants?.[0]?.url;
			return {
				value: m.id,
				label: m.title,
				subtitle: `${m.originalWidth}×${m.originalHeight}`,
				image: thumb
			};
		});
	} catch {
		return [];
	}
}

/** Fetches a single media by ID, used to resolve the initial label. */
export async function loadMediaById(id: string): Promise<SearchResult | undefined> {
	try {
		const media = await MEDIA_REQUEST.findById(fetch, id);
		return { value: media.id, label: media.title };
	} catch {
		return undefined;
	}
}
