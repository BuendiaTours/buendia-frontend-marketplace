<script lang="ts">
	/**
	 * ActivityMultimediaAccordion — Manages images linked to an activity.
	 * Delegates UI to FormMediaGallery, handles activity-specific API calls
	 * (media-relationship create/delete, activity update for reorder).
	 */
	import * as m from '$paraglide/messages';
	import { v4 as uuidv4 } from 'uuid';
	import type { EnrichedActivityImage } from '../[id]/content-blocks/+page.server';
	import { MEDIA_RELATIONSHIP_REQUEST } from '$core/multimedia/requests';
	import { MediaRelationshipEntityType } from '$core/multimedia/enums';
	import { ACTIVITY_REQUEST } from '$core/activities/requests';
	import FormMediaGallery, {
		type MediaGalleryItem
	} from '$lib/components/backoffice/forms/FormMediaGallery.svelte';

	type Props = {
		activityId: string;
		images: EnrichedActivityImage[];
		addToast: (toast: {
			data: { title: string; description: string; type: 'success' | 'error' };
		}) => void;
	};

	let { activityId, images = $bindable(), addToast }: Props = $props();

	function showToast(type: 'success' | 'error', description: string) {
		addToast({ data: { title: type === 'success' ? '✓' : '✗', description, type } });
	}

	async function handleAdd(newImages: MediaGalleryItem[]) {
		const added = newImages[newImages.length - 1];
		if (!added) return;

		try {
			await MEDIA_RELATIONSHIP_REQUEST.create(globalThis.fetch, {
				id: uuidv4(),
				entityId: activityId,
				mediaId: added.mediaId,
				entityType: MediaRelationshipEntityType.ACTIVITY
			});
			showToast('success', m.activities_multimediaAdded());
		} catch (err) {
			console.error('Error adding image:', err);
			// Revert optimistic add
			images = images.filter((img) => img.mediaId !== added.mediaId);
			showToast('error', m.activities_multimediaError());
		}
	}

	async function handleRemove(newImages: MediaGalleryItem[]) {
		const removedImage = images.find((img) => !newImages.some((n) => n.mediaId === img.mediaId));
		if (!removedImage) return;

		try {
			const relationships = await MEDIA_RELATIONSHIP_REQUEST.findByCriteria(globalThis.fetch, {
				entityId: activityId,
				mediaId: removedImage.mediaId,
				entityType: MediaRelationshipEntityType.ACTIVITY
			});
			const rel = relationships.data?.[0];
			if (rel) {
				await MEDIA_RELATIONSHIP_REQUEST.delete(globalThis.fetch, rel.id);
			}
			showToast('success', m.activities_multimediaRemoved());
		} catch (err) {
			console.error('Error removing image:', err);
			// Revert optimistic remove
			images = [...images, removedImage];
			showToast('error', m.activities_multimediaError());
		}
	}

	async function handleReorder(newImages: MediaGalleryItem[]) {
		const previousImages = [...images];
		try {
			await ACTIVITY_REQUEST.update(globalThis.fetch, activityId, {
				mediaIds: newImages.map((img) => img.mediaId)
			});
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
	onadd={handleAdd}
	onremove={handleRemove}
	onreorder={handleReorder}
/>
