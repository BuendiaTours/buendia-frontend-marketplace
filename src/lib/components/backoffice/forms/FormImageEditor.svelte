<script lang="ts">
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
	import type { ApiImage } from '$lib/types';
	import type {
		SicImageEditorInstance,
		EditorConfig
	} from '$lib/components/backoffice/SvelteImageCrop/types/imageEditorTypes';
	import type { VariantDefinition } from '$lib/components/backoffice/SvelteImageCrop/types/variantsConfigTypes';
	import type { ImageData } from '$lib/components/backoffice/SvelteImageCrop/types/persistedStateTypes';
	import SicImageEditor from '$lib/components/backoffice/SvelteImageCrop/components/SicImageEditor.svelte';
	import { createS3UploadManager } from '$lib/components/backoffice/SvelteImageCrop/utils/s3UploadManager.svelte';
	import { createS3EditManager } from '$lib/components/backoffice/SvelteImageCrop/utils/s3EditManager.svelte';
	import { imageCropVariants } from '$lib/config/image-crop-variants';

	type Props = {
		imageData?: Partial<ApiImage>;
		variantsConfig?: VariantDefinition[];
		editorConfig?: EditorConfig;
		onImageSaved?: (id: string) => void;
	};

	let {
		imageData,
		variantsConfig = imageCropVariants,
		editorConfig,
		onImageSaved
	}: Props = $props();

	const isEditMode = !!imageData?.id && !!imageData?.originalUrl;

	let editor: SicImageEditorInstance | undefined = $state();

	const managerConfig = { apiBaseUrl: PUBLIC_API_BASE_URL, onSaved: onImageSaved };
	const getEditor = () => editor;

	const uploadManager = !isEditMode ? createS3UploadManager(managerConfig, getEditor) : undefined;
	const editManager = isEditMode
		? createS3EditManager(managerConfig, getEditor, imageData.id ?? '')
		: undefined;

	const resolvedEditorConfig: EditorConfig = editorConfig ?? {
		showFileUpload: true,
		showZoomControls: true,
		showRotateControls: true,
		allowFreeRotate: false,
		showFlipControls: true,
		showGeneratedCrops: false,
		constrainToImage: true,
		imageDrag: true
	};
</script>

<SicImageEditor
	bind:this={editor}
	{variantsConfig}
	id={imageData?.id ?? ''}
	originalUrl={imageData?.originalUrl ?? ''}
	originalWidth={imageData?.originalWidth}
	originalHeight={imageData?.originalHeight}
	title={imageData?.title ?? ''}
	altText={imageData?.altText ?? ''}
	mimeType={imageData?.mimeType ?? ''}
	originalSizeBytes={imageData?.originalSizeBytes}
	initialState={isEditMode ? (imageData as unknown as ImageData) : undefined}
	layout="default"
	editorConfig={resolvedEditorConfig}
	onimageUploaded={uploadManager?.handleImageUploaded}
/>

<div class="mt-2 flex items-center justify-between gap-4 rounded-lg border border-zinc-700 p-3">
	{#if isEditMode && editManager}
		<p class="text-sm text-zinc-400">
			{#if editManager.saveStep === 'done'}
				✓ Imagen actualizada
			{:else if editManager.saveStep === 'error'}
				<span class="text-error">{editManager.saveError}</span>
			{:else if editManager.saveStep === 'generating'}
				<span class="loading loading-xs loading-spinner"></span> Generando recortes...
			{:else if editManager.saveStep === 'saving'}
				<span class="loading loading-xs loading-spinner"></span> Guardando...
			{:else}
				Ajusta los recortes y guarda
			{/if}
		</p>
		<div class="flex shrink-0 gap-2">
			{#if editManager.saveStep !== 'done'}
				<button
					type="button"
					class="btn btn-sm btn-primary btn-outline"
					disabled={!editManager.canSave || editManager.isSaving}
					onclick={() => editManager?.handleSave()}
				>
					{#if editManager.isSaving}<span class="loading loading-xs loading-spinner"></span>{/if}
					Guardar imagen
				</button>
			{/if}
		</div>
	{:else if uploadManager}
		<p class="text-sm text-zinc-400">
			{#if uploadManager.saveStep === 'done'}
				✓ Imagen guardada
			{:else if uploadManager.saveStep === 'error'}
				<span class="text-error">{uploadManager.saveError}</span>
			{:else if uploadManager.saveStep === 'generating'}
				<span class="loading loading-xs loading-spinner"></span> Generando recortes...
			{:else if uploadManager.saveStep === 'creating-record'}
				<span class="loading loading-xs loading-spinner"></span> Registrando...
			{:else if uploadManager.bgUpload === 'in-progress'}
				<span class="loading loading-xs loading-spinner"></span> Subiendo imagen...
			{:else if uploadManager.bgUpload === 'error'}
				<span class="text-error">✗ Error al subir</span>
			{:else if uploadManager.bgUpload === 'done'}
				✓ Lista para guardar
			{:else}
				Sube una imagen para continuar
			{/if}
		</p>
		<div class="flex shrink-0 gap-2">
			{#if uploadManager.bgUpload === 'error'}
				<button
					type="button"
					class="btn btn-outline btn-sm btn-primary"
					onclick={uploadManager.retryUpload}>Reintentar</button
				>
			{/if}
			{#if uploadManager.saveStep !== 'done'}
				<button
					type="button"
					class="btn btn-sm btn-primary btn-outline"
					disabled={!uploadManager.canSave || uploadManager.isSaving}
					onclick={() => uploadManager?.handleSave()}
				>
					{#if uploadManager.isSaving}<span class="loading loading-xs loading-spinner"></span>{/if}
					Guardar imagen
				</button>
			{/if}
		</div>
	{/if}
</div>
