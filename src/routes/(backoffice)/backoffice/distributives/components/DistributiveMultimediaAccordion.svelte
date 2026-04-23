<script lang="ts">
	/**
	 * DistributiveMultimediaAccordion — Manages images linked to a distributive.
	 * Delegates UI to FormMediaGallery, handles distributive-specific API calls
	 * via DISTRIBUTIVE_REQUEST.update({ mediaIds }) for add/remove/reorder.
	 */
	import * as m from '$paraglide/messages';
	import type { EnrichedDistributiveImage } from '../[id]/content-blocks/+page.server';
	import { DISTRIBUTIVE_REQUEST } from '$core/distributives/requests';
	import { DistributiveStatus } from '$core/distributives/enums';
	import FormMediaGallery, {
		type MediaGalleryItem
	} from '$lib/components/backoffice/forms/FormMediaGallery.svelte';

	type Props = {
		distributiveId: string;
		distributiveStatus?: DistributiveStatus;
		images: EnrichedDistributiveImage[];
		addToast: (toast: {
			data: { title: string; description: string; type: 'success' | 'error' };
		}) => void;
	};

	let { distributiveId, distributiveStatus, images = $bindable(), addToast }: Props = $props();

	const minImages = $derived(distributiveStatus === DistributiveStatus.PUBLISHED ? 1 : 0);

	function showToast(type: 'success' | 'error', description: string) {
		addToast({ data: { title: type === 'success' ? '✓' : '✗', description, type } });
	}

	async function updateMediaIds(newImages: MediaGalleryItem[]) {
		await DISTRIBUTIVE_REQUEST.update(globalThis.fetch, distributiveId, {
			mediaIds: newImages.map((img) => img.mediaId)
		});
	}

	async function handleAdd(newImages: MediaGalleryItem[]) {
		const added = newImages[newImages.length - 1];
		if (!added) return;

		try {
			await updateMediaIds(newImages);
			showToast('success', m.distributives_multimediaAdded());
		} catch (err) {
			console.error('Error adding image:', err);
			images = images.filter((img) => img.mediaId !== added.mediaId);
			showToast('error', m.distributives_multimediaError());
		}
	}

	async function handleRemove(newImages: MediaGalleryItem[]) {
		const removedImage = images.find((img) => !newImages.some((n) => n.mediaId === img.mediaId));
		if (!removedImage) return;

		try {
			await updateMediaIds(newImages);
			showToast('success', m.distributives_multimediaRemoved());
		} catch (err) {
			console.error('Error removing image:', err);
			images = [...images, removedImage];
			showToast('error', m.distributives_multimediaError());
		}
	}

	async function handleReorder(newImages: MediaGalleryItem[]) {
		const previousImages = [...images];
		try {
			await updateMediaIds(newImages);
		} catch (err) {
			console.error('Error reordering images:', err);
			images = previousImages;
			showToast('error', m.distributives_multimediaMoveError());
		}
	}
</script>

<FormMediaGallery
	bind:images
	sectionTitle={m.distributives_sectionMultimedia()}
	sectionDescription={m.distributives_sectionMultimediaDescription()}
	searchLabel={m.distributives_multimediaSearchLabel()}
	searchPlaceholder={m.distributives_multimediaSearchPlaceholder()}
	emptyText={m.distributives_multimediaEmpty()}
	showMeta
	reorderable
	{minImages}
	removeBlockedTooltip={m.distributives_multimediaRemoveBlockedTooltip()}
	onadd={handleAdd}
	onremove={handleRemove}
	onreorder={handleReorder}
/>
