<script lang="ts">
	import SicEditorContainer from '../SicImageEditor/SicEditorContainer.svelte';
	import SicGeneratedCrop from '../SicImageEditor/SicGeneratedCrop.svelte';
	import { onMount, tick } from 'svelte';
	import type { LayoutProps } from '$lib/components/backoffice/SvelteImageCrop/types/layoutTypes';

	// Props using Svelte 5 runes syntax
	let {
		wrapperClass = '',
		columnClass = 'w-[320px]',
		editorContainerComponent = $bindable(undefined),
		title = $bindable(''),
		altText = $bindable(''),
		imageSrc,
		imageX,
		imageY,
		activeCropBoxes,
		selectedCropBoxId,
		normalizedCrops,
		generatedCrops,
		manipulatingCropId,
		editorConfig,
		onFileUpload,
		onPositionChange,
		onCropBoxUpdate,
		onCropBoxRemove,
		onCropBoxSelect,
		onCropBoxDragEnd,
		onCropBoxReset,
		onToggleCropBox,
		onSelectCropBox: _onSelectCropBox,
		onRemoveAllCropBoxes,
		onGenerateCrops,
		onDeleteAllGeneratedCrops,
		onRegenerateCrop,
		onDeleteGeneratedCrop,
		fileInputName = undefined
	}: LayoutProps = $props();

	// Sync title with altText
	$effect(() => {
		title = altText;
	});

	// Function to auto-activate and generate the first crop box
	async function autoActivateAndGenerate() {
		if (normalizedCrops.length > 0) {
			const firstCrop = normalizedCrops[0];
			onToggleCropBox(firstCrop);
			await tick();

			if (activeCropBoxes.length > 0 && editorContainerComponent) {
				await editorContainerComponent.waitForImageReady();
				onGenerateCrops();
			}
		}
	}

	// Auto-initialization state
	let hasInitialized = $state(false);

	onMount(async () => {
		// Auto-activate first crop box if available and not already active
		if (normalizedCrops.length > 0 && activeCropBoxes.length === 0) {
			await autoActivateAndGenerate();
			hasInitialized = true;
		}
	});

	// Track imageSrc changes to regenerate crop when a new image is uploaded
	let trackedImageSrc = $state(imageSrc);

	$effect(() => {
		// Only react to changes after initial mount
		if (hasInitialized && imageSrc !== trackedImageSrc) {
			trackedImageSrc = imageSrc;

			// Clean up and regenerate
			(async () => {
				// Wait for new image to be ready
				await tick();

				// Remove existing active crop boxes
				if (activeCropBoxes.length > 0) {
					onRemoveAllCropBoxes();
					await tick();
				}

				// Remove existing generated crops
				if (generatedCrops.length > 0) {
					onDeleteAllGeneratedCrops();
					await tick();
				}

				// Re-activate and generate
				await autoActivateAndGenerate();
			})();
		}
	});
</script>

<div class="sic-image-editor-default flex-col space-y-2 {wrapperClass}">
	<div class="flex flex-row gap-2"></div>

	<div class="flex flex-row gap-2">
		<div class="flex flex-1 flex-col gap-2">
			<SicEditorContainer
				wrapperClass="flex-1"
				bind:this={editorContainerComponent}
				{imageSrc}
				initialX={imageX}
				initialY={imageY}
				{activeCropBoxes}
				{selectedCropBoxId}
				{editorConfig}
				{onPositionChange}
				{onCropBoxUpdate}
				{onCropBoxRemove}
				{onCropBoxSelect}
				onCropBoxDragEnd={() => {
					onCropBoxDragEnd?.();
					onGenerateCrops();
				}}
				{onCropBoxReset}
			/>
		</div>

		<!-- Sidebar -->
		<div class="flex {columnClass} flex-col gap-2">
			{#if editorConfig.showFileUpload}
				<input
					type="file"
					class="sic-input-file file-input w-full"
					accept="image/*"
					name={fileInputName}
					onchange={onFileUpload}
				/>
			{/if}

			<input
				type="text"
				bind:value={altText}
				class="sic-input-alt input input-md w-full"
				placeholder="Texto alternativo descriptivo"
				required
			/>

			<input type="hidden" bind:value={title} />

			<!-- Generated Crops Display -->
			{#if generatedCrops.length > 0}
				{#if generatedCrops.length > 0}
					<div class="flex flex-row gap-2">
						{#each generatedCrops as crop (crop.id)}
							<SicGeneratedCrop
								{crop}
								isHighlighted={manipulatingCropId === crop.id}
								{editorConfig}
								onRegenerate={() => onRegenerateCrop(crop.id)}
								onDelete={() => onDeleteGeneratedCrop(crop.id)}
							/>
						{/each}
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>
