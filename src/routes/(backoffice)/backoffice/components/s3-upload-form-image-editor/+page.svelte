<script lang="ts">
	import { onMount } from 'svelte';
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
	import type { BackofficePhoto } from '$lib/types';
	import FormImageEditor from '$lib/components/backoffice/forms/FormImageEditor.svelte';

	const EXISTING_MEDIA_ID = '66666666-6666-6666-6666-666666666666';

	let existingMedia = $state<Partial<BackofficePhoto> | null>(null);
	let loadError = $state<string | null>(null);

	onMount(async () => {
		try {
			const res = await fetch(`${PUBLIC_API_BASE_URL}/media/${EXISTING_MEDIA_ID}`);
			if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
			existingMedia = await res.json();
		} catch (e) {
			loadError = e instanceof Error ? e.message : String(e);
		}
	});
</script>

<main class="mx-auto max-w-7xl p-8">
	<div class="mb-6 flex flex-col gap-0">
		<h1 class="text-2xl font-bold">FormImageEditor — Demo</h1>
		<p class="text-sm text-zinc-400">
			Usando el componente FormImageEditor (upload + edit en un solo wrapper)
		</p>
	</div>

	<!-- Demo 1 — Minimal config -->
	<p class="h3">Ejemplo mínimos ajustes</p>
	<div class="mb-6 rounded-lg border border-zinc-700 p-6">
		<FormImageEditor
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
	</div>

	<!-- Demo 2 — Full config -->
	<p class="h3">Ejemplo con más opciones</p>
	<div class="mb-6 rounded-lg border border-zinc-700 p-6">
		<FormImageEditor
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
		/>
	</div>

	<!-- Demo 3 — Edit mode -->
	<p class="h3">Ejemplo edición de imagen existente</p>
	<p class="mb-4 text-sm text-zinc-400">
		Simula cargar un registro ya guardado (ID: <code class="text-zinc-200">{EXISTING_MEDIA_ID}</code
		>).
	</p>
	<div class="mb-6 rounded-lg border border-zinc-700 p-6">
		{#if loadError}
			<p class="text-error text-sm">Error al cargar el media: {loadError}</p>
		{:else if existingMedia}
			<FormImageEditor imageData={existingMedia} />
		{:else}
			<div class="flex items-center gap-2 text-sm text-zinc-400">
				<span class="loading loading-spinner loading-sm"></span> Cargando media...
			</div>
		{/if}
	</div>
</main>
