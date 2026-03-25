<script lang="ts">
	import SicEditorContainer from '../SicImageEditor/SicEditorContainer.svelte';
	import SicCropVariant from '../SicImageEditor/SicCropVariant.svelte';
	import SicGeneratedCrop from '../SicImageEditor/SicGeneratedCrop.svelte';
	import { Album } from '$lib/icons/Linear';
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
		onSelectCropBox,
		onRemoveAllCropBoxes: _onRemoveAllCropBoxes,
		onGenerateCrops,
		onDeleteAllGeneratedCrops: _onDeleteAllGeneratedCrops,
		onRegenerateCrop,
		onDeleteGeneratedCrop,
		fileInputName = undefined
	}: LayoutProps = $props();

	// Sync title with altText
	$effect(() => {
		title = altText;
	});
</script>

<div class="sic-image-editor-default flex-col space-y-2 {wrapperClass}">
	<div class="flex flex-row gap-2"></div>

	<div class="flex flex-row gap-2">
		<div class="flex flex-1 flex-col gap-2">
			{#if editorConfig.showFileUpload}
				<input
					type="file"
					class="sic-input-file file-input w-full {columnClass}"
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
				{onCropBoxDragEnd}
				{onCropBoxReset}
			/>
		</div>

		<!-- Sidebar -->
		<div class="flex {columnClass} flex-col gap-2">
			{#key activeCropBoxes.length}
				<div class="grid grid-cols-1 gap-2 md:grid-cols-2">
					{#each normalizedCrops as crop (crop.id)}
						{@const activeCropBox = activeCropBoxes.find((ac) => ac.crop.id === crop.id)}
						{@const isActive = !!activeCropBox}
						{@const isSelected = activeCropBox && selectedCropBoxId === activeCropBox.instanceId}
						<SicCropVariant
							{crop}
							{isActive}
							{isSelected}
							isLowResolution={false}
							showToggle={editorConfig.showVariantToggleButton ?? false}
							onToggle={() => onToggleCropBox(crop)}
							onSelect={() => activeCropBox && onSelectCropBox(activeCropBox.instanceId)}
						/>
					{/each}
				</div>
			{/key}

			{#if activeCropBoxes.length > 0}
				<div class="flex gap-2">
					<!-- {#if editorConfig.showDisableAllVariantsButton}
						<button type="button" class="sic-disable-all-variants btn flex-1 btn-outline btn-sm btn-error" onclick={() => onRemoveAllCropBoxes()}>
							<Cancel class="size-5" /><span>Desactivar todos</span>
						</button>
					{/if} -->
					<button
						type="button"
						class="btn btn-outline btn-sm btn-success flex-1"
						onclick={() => onGenerateCrops()}
					>
						<Album class="size-5" /><span>Generar recorte</span>
					</button>
				</div>
			{/if}

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
