<script lang="ts">
	/**
	 * FreeTourMultimediaAccordion — Manages images linked to a free tour.
	 * Uses FREE_TOUR_REQUEST.update({ mediaIds }) for add/remove/reorder.
	 */
	import * as m from '$paraglide/messages';
	import type { EnrichedFreeTourImage } from '../[id]/content/+page.server';
	import { FREE_TOUR_REQUEST } from '$core/free-tours/requests';
	import FormMediaGallery, {
		type MediaGalleryItem
	} from '$lib/components/backoffice/forms/FormMediaGallery.svelte';

	type Props = {
		freeTourId: string;
		images: EnrichedFreeTourImage[];
		addToast: (toast: {
			data: { title: string; description: string; type: 'success' | 'error' };
		}) => void;
	};

	let { freeTourId, images = $bindable(), addToast }: Props = $props();

	function showToast(type: 'success' | 'error', description: string) {
		addToast({ data: { title: type === 'success' ? '✓' : '✗', description, type } });
	}

	async function updateMediaIds(newImages: MediaGalleryItem[]) {
		await FREE_TOUR_REQUEST.update(globalThis.fetch, freeTourId, {
			mediaIds: newImages.map((img) => img.mediaId)
		});
	}

	async function handleChange(newImages: MediaGalleryItem[]) {
		try {
			await updateMediaIds(newImages);
			images = newImages as EnrichedFreeTourImage[];
			showToast('success', m.activities_multimediaAdded());
		} catch (err) {
			console.error('Error updating media:', err);
			showToast('error', m.activities_multimediaError());
		}
	}
</script>

<FormMediaGallery
	bind:images
	sectionTitle={m.activities_sectionMultimedia()}
	sectionDescription={m.activities_sectionMultimediaDescription()}
	searchLabel={m.activities_multimediaSearchLabel()}
	searchPlaceholder={m.activities_multimediaSearchPlaceholder()}
	emptyText={m.activities_multimediaEmpty()}
	showMeta
	reorderable
	onadd={handleChange}
	onremove={handleChange}
	onreorder={handleChange}
/>
