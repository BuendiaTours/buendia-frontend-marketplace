<script lang="ts">
	/**
	 * MediaForm — Edit form for media assets.
	 * Shows title/altText form + SicImageEditor for adjusting focal points/crops.
	 * "Guardar cambios" saves metadata, then sends crop focalPoints, then redirects to list.
	 */
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
	import type { Media } from '$core/multimedia/types';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { MediaFormSchema } from '../schemas/media-form.schema';
	import type { SicImageEditorInstance } from '$lib/components/backoffice/SvelteImageCrop/types/imageEditorTypes';

	import SicImageEditor from '$lib/components/backoffice/SvelteImageCrop/components/SicImageEditor.svelte';
	import { createS3EditManager } from '$lib/components/backoffice/SvelteImageCrop/utils/s3EditManager.svelte';
	import { imageCropVariants } from '$lib/config/image-crop-variants';
	import MediaEditForm from './MediaEditForm.svelte';

	type Props = {
		form: SuperValidated<MediaFormSchema>;
		mediaId: string;
		media: Media;
		/** Number of activities using this media asset. */
		activityCount?: number;
	};

	let { form: formData, mediaId, media, activityCount = 0 }: Props = $props();

	let editor: SicImageEditorInstance | undefined = $state();
	const getEditor = () => editor;

	// svelte-ignore state_referenced_locally
	const editManager = createS3EditManager({ apiBaseUrl: PUBLIC_API_BASE_URL }, getEditor, mediaId);

	/** Called after metadata save — sends focalPoints before the redirect happens. */
	async function handleAfterSave() {
		await editManager.handleSave();
	}

	/** Convert API focalPoints array to a Record keyed by preset for the editor. */
	// svelte-ignore state_referenced_locally
	const focalPointsMap: Record<string, { x: number; y: number; scale: number }> | undefined =
		media.focalPoints && media.focalPoints.length > 0
			? Object.fromEntries(
					media.focalPoints.map((fp) => [fp.preset, { x: fp.x, y: fp.y, scale: fp.scale }])
				)
			: undefined;
</script>

<MediaEditForm form={formData} {mediaId} {activityCount} onAfterSave={handleAfterSave} />

<div class="sic-hide-metadata mt-4 rounded-lg border border-zinc-700 p-6">
	<SicImageEditor
		bind:this={editor}
		variantsConfig={imageCropVariants}
		id={media.id}
		originalUrl={media.originalUrl}
		originalWidth={media.originalWidth}
		originalHeight={media.originalHeight}
		title={media.title}
		altText={media.altText}
		mimeType={media.mimeType}
		originalSizeBytes={media.originalSizeBytes}
		savedFocalPoints={focalPointsMap}
		layout="default"
		editorConfig={{
			showFileUpload: false,
			showZoomControls: true,
			showRotateControls: true,
			allowFreeRotate: false,
			showFlipControls: false,
			showGeneratedCrops: false,
			constrainToImage: true,
			imageDrag: true,
			showCropDeleteButtons: false,
			showCropDownloadButton: true,
			showCropNewTabButton: true,
			showCropRefreshButton: true,
			showDisableAllVariantsButton: false,
			showVariantToggleButton: true
		}}
	/>
</div>

<style>
	.sic-hide-metadata :global(.sic-input-title),
	.sic-hide-metadata :global(.sic-input-alt) {
		display: none;
	}
</style>
