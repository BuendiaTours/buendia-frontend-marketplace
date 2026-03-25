<script lang="ts">
	import { onMount } from 'svelte';
	import variantsConfig from '$lib/components/backoffice/SvelteImageCrop/config/sample-variants-config.json';
	import { imageCropVariants } from '$lib/config/image-crop-variants';
	import SicImageEditor from '$lib/components/backoffice/SvelteImageCrop/components/SicImageEditor.svelte';
	import type { SicImageEditorInstance } from '$lib/components/backoffice/SvelteImageCrop/types/imageEditorTypes';
	import type { ImageData } from '$lib/components/backoffice/SvelteImageCrop/types/persistedStateTypes';

	import { createS3UploadManager } from '$lib/components/backoffice/SvelteImageCrop/utils/s3UploadManager.svelte';
	import { createS3EditManager } from '$lib/components/backoffice/SvelteImageCrop/utils/s3EditManager.svelte';

	const API_BASE_URL = 'http://localhost:5555';
	const EXISTING_MEDIA_ID = '66666666-6666-6666-6666-666666666666';

	let editor1: SicImageEditorInstance | undefined = $state();
	let editor2: SicImageEditorInstance | undefined = $state();
	let editor3: SicImageEditorInstance | undefined = $state();

	const editor_1 = createS3UploadManager({ apiBaseUrl: API_BASE_URL }, () => editor1);
	const editor_2 = createS3UploadManager({ apiBaseUrl: API_BASE_URL }, () => editor2);
	const editor_3 = createS3EditManager(
		{ apiBaseUrl: API_BASE_URL },
		() => editor3,
		EXISTING_MEDIA_ID
	);

	let existingMedia = $state<ImageData | null>(null);
	let loadError = $state<string | null>(null);

	onMount(async () => {
		try {
			const res = await fetch(`${API_BASE_URL}/media/${EXISTING_MEDIA_ID}`);
			if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
			existingMedia = await res.json();
		} catch (e) {
			loadError = e instanceof Error ? e.message : String(e);
		}
	});
</script>

<main class="mx-auto max-w-7xl p-8">
	<div class="mb-6 flex flex-col gap-0">
		<h1 class="text-2xl font-bold">S3 Presigned URL Upload</h1>
		<p class="text-sm text-zinc-400">Sube la imagen en background mientras ajustas los recortes</p>
	</div>

	<!-- Editor 1 (sin thumbnails ni "Generar todos") -->
	<p class="h3">Ejemplo minimos ajustes</p>
	<div class="mb-6 rounded-lg border border-zinc-700 p-6">
		<SicImageEditor
			bind:this={editor1}
			variantsConfig={imageCropVariants}
			originalUrl=""
			id=""
			title=""
			mimeType=""
			altText=""
			layout="default"
			editorConfig={{
				constrainToImage: true,
				imageDrag: true,
				showCropDeleteButtons: false,
				showCropDownloadButton: true,
				showCropNewTabButton: true,
				showCropRefreshButton: true,
				showDisableAllVariantsButton: false,
				showFileUpload: true,
				showFlipControls: false,
				showGeneratedCrops: false,
				showZoomControls: true
			}}
			onimageUploaded={editor_1.handleImageUploaded}
		/>

		<!-- Upload + save panel -->
		<div class="mt-2 flex items-center justify-between gap-4 rounded-lg border border-zinc-700 p-3">
			<p class="text-sm text-zinc-400">
				{#if editor_1.saveStep === 'done'}
					✓ ¡Media creado! ID: <code class="text-zinc-200">{editor_1.createdMediaId}</code>
				{:else if editor_1.saveStep === 'error'}
					<span class="text-error">{editor_1.saveError}</span>
				{:else if editor_1.saveStep === 'generating'}
					<span class="loading loading-xs loading-spinner"></span> Generando recortes...
				{:else if editor_1.saveStep === 'creating-record'}
					<span class="loading loading-xs loading-spinner"></span> Registrando...
				{:else if editor_1.bgUpload === 'in-progress'}
					<span class="loading loading-xs loading-spinner"></span> Subiendo a S3...
				{:else if editor_1.bgUpload === 'error'}
					<span class="text-error">✗ Error al subir</span>
				{:else if editor_1.bgUpload === 'done'}
					✓ Lista para guardar
				{:else}
					Sube una imagen para continuar
				{/if}
			</p>
			<div class="flex shrink-0 gap-2">
				{#if editor_1.bgUpload === 'error'}
					<button
						type="button"
						class="btn btn-outline btn-sm btn-primary"
						onclick={editor_1.retryUpload}>Reintentar</button
					>
				{/if}
				{#if editor_1.saveStep !== 'done'}
					<button
						type="button"
						class="btn btn-outline btn-sm btn-primary"
						disabled={!editor_1.canSave || editor_1.isSaving}
						onclick={(e) => {
							e.preventDefault();
							editor_1.handleSave();
						}}
					>
						{#if editor_1.isSaving}<span class="loading loading-xs loading-spinner"></span>{/if}
						Guardar
					</button>
				{/if}
			</div>
		</div>
	</div>

	<!-- Editor 2 (completo) -->
	<p class="h3">Ejemplo con más options</p>
	<form
		onsubmit={(e) => {
			e.preventDefault();
			editor_2.handleSave();
		}}
	>
		<div class="mb-6 rounded-lg border border-zinc-700 p-6">
			<SicImageEditor
				bind:this={editor2}
				{variantsConfig}
				originalUrl=""
				id=""
				title=""
				mimeType=""
				altText=""
				layout="default"
				editorConfig={{
					constrainToImage: false,
					imageDrag: true,
					showCropDeleteButtons: true,
					showCropDownloadButton: true,
					showCropNewTabButton: true,
					showCropRefreshButton: true,
					showDisableAllVariantsButton: false,
					showFileUpload: true,
					showFlipControls: false,
					showZoomControls: true
				}}
				onimageUploaded={editor_2.handleImageUploaded}
			/>

			<!-- Upload + save panel -->
			<div
				class="mt-2 flex items-center justify-between gap-4 rounded-lg border border-zinc-700 p-3"
			>
				<!-- Status -->
				<p class="text-sm text-zinc-400">
					{#if editor_2.saveStep === 'done'}
						✓ ¡Media creado! ID: <code class="text-zinc-200">{editor_2.createdMediaId}</code>
					{:else if editor_2.saveStep === 'error'}
						<span class="text-error">{editor_2.saveError}</span>
					{:else if editor_2.saveStep === 'generating'}
						<span class="loading loading-xs loading-spinner"></span> Generando recortes...
					{:else if editor_2.saveStep === 'creating-record'}
						<span class="loading loading-xs loading-spinner"></span> Registrando...
					{:else if editor_2.bgUpload === 'in-progress'}
						<span class="loading loading-xs loading-spinner"></span> Subiendo a S3...
					{:else if editor_2.bgUpload === 'error'}
						<span class="text-error">✗ Error al subir</span>
					{:else if editor_2.bgUpload === 'done'}
						✓ Lista para guardar
					{:else}
						Sube una imagen para continuar
					{/if}
				</p>
				<!-- Actions -->
				<div class="flex shrink-0 gap-2">
					{#if editor_2.bgUpload === 'error'}
						<button type="button" class="btn btn-outline btn-sm" onclick={editor_2.retryUpload}
							>Reintentar</button
						>
					{/if}
					{#if editor_2.saveStep !== 'done'}
						<button
							type="submit"
							class="btn btn-sm btn-primary"
							disabled={!editor_2.canSave || editor_2.isSaving}
						>
							{#if editor_2.isSaving}<span class="loading loading-xs loading-spinner"></span>{/if}
							Guardar
						</button>
					{/if}
				</div>
			</div>
		</div>
	</form>

	<!-- Editor 3 (modo edición — imagen pre-existente cargada desde API) -->
	<p class="h3">Ejemplo edición de imagen existente</p>
	<p class="mb-4 text-sm text-zinc-400">
		Simula cargar un registro ya guardado (ID: <code class="text-zinc-200">{EXISTING_MEDIA_ID}</code
		>). El servidor resuelve la S3 key a una presigned URL antes de responder.
	</p>
	<div class="mb-6 rounded-lg border border-zinc-700 p-6">
		{#if loadError}
			<p class="text-error text-sm">Error al cargar el media: {loadError}</p>
		{:else if existingMedia}
			<SicImageEditor
				bind:this={editor3}
				variantsConfig={imageCropVariants}
				id={existingMedia.id}
				originalUrl={existingMedia.originalUrl}
				originalWidth={existingMedia.originalWidth}
				originalHeight={existingMedia.originalHeight}
				title={existingMedia.title}
				altText={existingMedia.altText}
				mimeType={existingMedia.mimeType}
				initialState={existingMedia}
				layout="default"
				editorConfig={{
					constrainToImage: true,
					imageDrag: true,
					showCropDeleteButtons: false,
					showCropDownloadButton: true,
					showCropNewTabButton: true,
					showCropRefreshButton: true,
					showDisableAllVariantsButton: false,
					showFileUpload: true,
					showFlipControls: false,
					showGeneratedCrops: false,
					showZoomControls: true
				}}
			/>

			<!-- Save panel -->
			<div
				class="mt-2 flex items-center justify-between gap-4 rounded-lg border border-zinc-700 p-3"
			>
				<p class="text-sm text-zinc-400">
					{#if editor_3.saveStep === 'done'}
						✓ ¡Media actualizado! ID: <code class="text-zinc-200">{editor_3.updatedMediaId}</code>
					{:else if editor_3.saveStep === 'error'}
						<span class="text-error">{editor_3.saveError}</span>
					{:else if editor_3.saveStep === 'generating'}
						<span class="loading loading-xs loading-spinner"></span> Generando recortes...
					{:else if editor_3.saveStep === 'saving'}
						<span class="loading loading-xs loading-spinner"></span> Guardando...
					{:else}
						Ajusta los recortes y guarda
					{/if}
				</p>
				<div class="flex shrink-0 gap-2">
					{#if editor_3.saveStep !== 'done'}
						<button
							type="button"
							class="btn btn-sm btn-primary"
							disabled={!editor_3.canSave || editor_3.isSaving}
							onclick={() => editor_3.handleSave()}
						>
							{#if editor_3.isSaving}<span class="loading loading-xs loading-spinner"></span>{/if}
							Guardar cambios
						</button>
					{/if}
				</div>
			</div>
		{:else}
			<div class="flex items-center gap-2 text-sm text-zinc-400">
				<span class="loading loading-spinner loading-sm"></span> Cargando media...
			</div>
		{/if}
	</div>
</main>
