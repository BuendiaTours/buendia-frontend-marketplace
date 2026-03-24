<script lang="ts">
	import { onMount } from 'svelte';
	import variantsConfig from '$lib/components/backoffice/SvelteImageCrop/config/sample-variants-config.json';
	import variantsConfigS3 from './variants-config.json';
	import SicImageEditor from '$lib/components/backoffice/SvelteImageCrop/components/SicImageEditor.svelte';
	import type { SicImageEditorInstance } from '$lib/components/backoffice/SvelteImageCrop/types/imageEditorTypes';
	import type { ImageData } from '$lib/components/backoffice/SvelteImageCrop/types/persistedStateTypes';
	import { EDITOR_CONFIG_PRESETS } from '$lib/components/backoffice/SvelteImageCrop/demo/demoHelpers';

	import { createS3UploadManager } from '$lib/components/backoffice/SvelteImageCrop/utils/s3UploadManager.svelte';
	import { createS3EditManager } from '$lib/components/backoffice/SvelteImageCrop/utils/s3EditManager.svelte';

	const API_BASE_URL = 'http://localhost:5555';
	const EXISTING_MEDIA_ID = '66666666-6666-6666-6666-666666666666';

	let editor1: SicImageEditorInstance | undefined = $state();
	let editor2: SicImageEditorInstance | undefined = $state();
	let editor3: SicImageEditorInstance | undefined = $state();

	const upload1 = createS3UploadManager({ apiBaseUrl: API_BASE_URL }, () => editor1);
	const upload2 = createS3UploadManager({ apiBaseUrl: API_BASE_URL }, () => editor2);
	const edit3 = createS3EditManager({ apiBaseUrl: API_BASE_URL }, () => editor3, EXISTING_MEDIA_ID);

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
	<div class="mb-6 flex items-center gap-4">
		<a href="/" class="btn btn-ghost btn-sm">← Inicio</a>
		<div>
			<h1 class="text-2xl font-bold">S3 Presigned URL Upload</h1>
			<p class="text-sm text-zinc-400">
				Sube la imagen en background mientras ajustas los recortes
			</p>
		</div>
	</div>

	<!-- Editor 1 (sin thumbnails ni "Generar todos") -->
	<p class="h3">Ejemplo minimos ajustes</p>
	<div class="mb-6 rounded-lg border border-zinc-700 p-6">
		<SicImageEditor
			bind:this={editor1}
			variantsConfig={variantsConfigS3}
			originalUrl=""
			id=""
			title=""
			mimeType=""
			altText=""
			layout="default"
			editorConfig={{
				...EDITOR_CONFIG_PRESETS.FULL,
				showGeneratedCrops: false,
				showCropDeleteButtons: false,
				constrainToImage: true
			}}
			on:imageUploaded={upload1.handleImageUploaded}
		/>

		<!-- Upload + save panel -->
		<div class="mt-2 flex items-center justify-between gap-4 rounded-lg border border-zinc-700 p-3">
			<p class="text-sm text-zinc-400">
				{#if upload1.saveStep === 'done'}
					✓ ¡Media creado! ID: <code class="text-zinc-200">{upload1.createdMediaId}</code>
				{:else if upload1.saveStep === 'error'}
					<span class="text-error">{upload1.saveError}</span>
				{:else if upload1.saveStep === 'generating'}
					<span class="loading loading-xs loading-spinner"></span> Generando recortes...
				{:else if upload1.saveStep === 'creating-record'}
					<span class="loading loading-xs loading-spinner"></span> Registrando...
				{:else if upload1.bgUpload === 'in-progress'}
					<span class="loading loading-xs loading-spinner"></span> Subiendo a S3...
				{:else if upload1.bgUpload === 'error'}
					<span class="text-error">✗ Error al subir</span>
				{:else if upload1.bgUpload === 'done'}
					✓ Lista para guardar
				{:else}
					Sube una imagen para continuar
				{/if}
			</p>
			<div class="flex shrink-0 gap-2">
				{#if upload1.bgUpload === 'error'}
					<button type="button" class="btn btn-outline btn-sm" onclick={upload1.retryUpload}
						>Reintentar</button
					>
				{/if}
				{#if upload1.saveStep !== 'done'}
					<button
						type="button"
						class="btn btn-sm btn-primary"
						disabled={!upload1.canSave || upload1.isSaving}
						onclick={(e) => {
							e.preventDefault();
							upload1.handleSave();
						}}
					>
						{#if upload1.isSaving}<span class="loading loading-xs loading-spinner"></span>{/if}
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
			upload2.handleSave();
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
				editorConfig={EDITOR_CONFIG_PRESETS.FULL}
				on:imageUploaded={upload2.handleImageUploaded}
			/>

			<!-- Upload + save panel -->
			<div
				class="mt-2 flex items-center justify-between gap-4 rounded-lg border border-zinc-700 p-3"
			>
				<!-- Status -->
				<p class="text-sm text-zinc-400">
					{#if upload2.saveStep === 'done'}
						✓ ¡Media creado! ID: <code class="text-zinc-200">{upload2.createdMediaId}</code>
					{:else if upload2.saveStep === 'error'}
						<span class="text-error">{upload2.saveError}</span>
					{:else if upload2.saveStep === 'generating'}
						<span class="loading loading-xs loading-spinner"></span> Generando recortes...
					{:else if upload2.saveStep === 'creating-record'}
						<span class="loading loading-xs loading-spinner"></span> Registrando...
					{:else if upload2.bgUpload === 'in-progress'}
						<span class="loading loading-xs loading-spinner"></span> Subiendo a S3...
					{:else if upload2.bgUpload === 'error'}
						<span class="text-error">✗ Error al subir</span>
					{:else if upload2.bgUpload === 'done'}
						✓ Lista para guardar
					{:else}
						Sube una imagen para continuar
					{/if}
				</p>
				<!-- Actions -->
				<div class="flex shrink-0 gap-2">
					{#if upload2.bgUpload === 'error'}
						<button type="button" class="btn btn-outline btn-sm" onclick={upload2.retryUpload}
							>Reintentar</button
						>
					{/if}
					{#if upload2.saveStep !== 'done'}
						<button
							type="submit"
							class="btn btn-sm btn-primary"
							disabled={!upload2.canSave || upload2.isSaving}
						>
							{#if upload2.isSaving}<span class="loading loading-xs loading-spinner"></span>{/if}
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
				variantsConfig={variantsConfigS3}
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
					...EDITOR_CONFIG_PRESETS.FULL,
					showGeneratedCrops: false,
					showCropDeleteButtons: false,
					constrainToImage: true
				}}
			/>

			<!-- Save panel -->
			<div
				class="mt-2 flex items-center justify-between gap-4 rounded-lg border border-zinc-700 p-3"
			>
				<p class="text-sm text-zinc-400">
					{#if edit3.saveStep === 'done'}
						✓ ¡Media actualizado! ID: <code class="text-zinc-200">{edit3.updatedMediaId}</code>
					{:else if edit3.saveStep === 'error'}
						<span class="text-error">{edit3.saveError}</span>
					{:else if edit3.saveStep === 'generating'}
						<span class="loading loading-xs loading-spinner"></span> Generando recortes...
					{:else if edit3.saveStep === 'saving'}
						<span class="loading loading-xs loading-spinner"></span> Guardando...
					{:else}
						Ajusta los recortes y guarda
					{/if}
				</p>
				<div class="flex shrink-0 gap-2">
					{#if edit3.saveStep !== 'done'}
						<button
							type="button"
							class="btn btn-sm btn-primary"
							disabled={!edit3.canSave || edit3.isSaving}
							onclick={() => edit3.handleSave()}
						>
							{#if edit3.isSaving}<span class="loading loading-xs loading-spinner"></span>{/if}
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
