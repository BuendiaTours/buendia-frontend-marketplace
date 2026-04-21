<script lang="ts">
	/**
	 * ActivityMultimediaAccordion — Manages images linked to an activity.
	 * Delegates UI to FormMediaGallery, handles activity-specific API calls
	 * via ACTIVITY_REQUEST.update({ mediaIds }) for add/remove/reorder.
	 */
	import * as m from '$paraglide/messages';
	import type { EnrichedActivityImage } from '../[id]/content-blocks/+page.server';
	import { ACTIVITY_REQUEST } from '$core/activities/requests';
	import { ActivityStatus } from '$core/activities/enums';
	import FormMediaGallery, {
		type MediaGalleryItem
	} from '$lib/components/backoffice/forms/FormMediaGallery.svelte';

	type Props = {
		activityId: string;
		activityStatus?: ActivityStatus;
		images: EnrichedActivityImage[];
		addToast: (toast: {
			data: { title: string; description: string; type: 'success' | 'error' };
		}) => void;
	};

	let { activityId, activityStatus, images = $bindable(), addToast }: Props = $props();

	// Published activities must keep at least one image; force unpublish before
	// emptying the gallery.
	const minImages = $derived(activityStatus === ActivityStatus.PUBLISHED ? 1 : 0);

	function showToast(type: 'success' | 'error', description: string) {
		addToast({ data: { title: type === 'success' ? '✓' : '✗', description, type } });
	}

	async function updateMediaIds(newImages: MediaGalleryItem[]) {
		await ACTIVITY_REQUEST.update(globalThis.fetch, activityId, {
			mediaIds: newImages.map((img) => img.mediaId)
		});
	}

	async function handleAdd(newImages: MediaGalleryItem[]) {
		const added = newImages[newImages.length - 1];
		if (!added) return;

		try {
			await updateMediaIds(newImages);
			showToast('success', m.activities_multimediaAdded());
		} catch (err) {
			console.error('Error adding image:', err);
			images = images.filter((img) => img.mediaId !== added.mediaId);
			showToast('error', m.activities_multimediaError());
		}
	}

	async function handleRemove(newImages: MediaGalleryItem[]) {
		const removedImage = images.find((img) => !newImages.some((n) => n.mediaId === img.mediaId));
		if (!removedImage) return;

		try {
			await updateMediaIds(newImages);
			showToast('success', m.activities_multimediaRemoved());
		} catch (err) {
			console.error('Error removing image:', err);
			images = [...images, removedImage];
			showToast('error', m.activities_multimediaError());
		}
	}

	async function handleReorder(newImages: MediaGalleryItem[]) {
		const previousImages = [...images];
		try {
			await updateMediaIds(newImages);
		} catch (err) {
			console.error('Error reordering images:', err);
			images = previousImages;
			showToast('error', m.activities_multimediaMoveError());
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
	{minImages}
	removeBlockedTooltip={m.activities_multimediaRemoveBlockedTooltip()}
	onadd={handleAdd}
	onremove={handleRemove}
	onreorder={handleReorder}
/>
