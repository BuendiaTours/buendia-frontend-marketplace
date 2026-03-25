<script lang="ts">
	import SicEditorContainer from '../SicImageEditor/SicEditorContainer.svelte';
	import SicCropVariant from '../SicImageEditor/SicCropVariant.svelte';
	import SicGeneratedCrop from '../SicImageEditor/SicGeneratedCrop.svelte';
	import { Album, TrashBinTrash, CustomMiniCancel } from '$lib/icons/Linear';
	import type { LayoutProps } from '$lib/components/backoffice/SvelteImageCrop/types/layoutTypes';

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
		hasLowResolutionCrops,
		lowResolutionCropIds,
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
		onRemoveAllCropBoxes,
		onGenerateCrops,
		onDeleteAllGeneratedCrops,
		onRegenerateCrop,
		onDeleteGeneratedCrop,
		fileInputName = undefined
	}: LayoutProps = $props();
</script>

{#if imageSrc}
	<div class="sic-image-editor-default flex-col space-y-2 {wrapperClass}">
		<div class="flex flex-row gap-2">
			<input
				type="text"
				bind:value={title}
				class="sic-input-title input input-md w-full"
				placeholder="Título"
				required
			/>

			{#if editorConfig.showFileUpload}
				<input
					type="file"
					class="sic-input-file file-input {columnClass}"
					accept="image/*"
					name={fileInputName}
					onchange={onFileUpload}
				/>
			{/if}
		</div>

		<div class="flex flex-row gap-2">
			<input
				type="text"
				bind:value={altText}
				class="sic-input-alt input input-md w-full"
				placeholder="Texto alternativo descriptivo"
				required
			/>
		</div>

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
					{onCropBoxDragEnd}
					{onCropBoxReset}
				/>
			</div>

			<!-- Sidebar -->
			<div class="flex {columnClass} flex-col gap-2">
				{#key activeCropBoxes.length}
					<div class="flex flex-col gap-2">
						{#each normalizedCrops as crop (crop.id)}
							{@const activeCropBox = activeCropBoxes.find((ac) => ac.crop.id === crop.id)}
							{@const isActive = !!activeCropBox}
							{@const isSelected = activeCropBox && selectedCropBoxId === activeCropBox.instanceId}
							<SicCropVariant
								{crop}
								{isActive}
								{isSelected}
								isLowResolution={lowResolutionCropIds.has(crop.id)}
								showToggle={editorConfig.showVariantToggleButton ?? false}
								onToggle={() => onToggleCropBox(crop)}
								onSelect={() => activeCropBox && onSelectCropBox(activeCropBox.instanceId)}
							/>
						{/each}
					</div>
				{/key}

				{#if activeCropBoxes.length > 0}
					{#if hasLowResolutionCrops}
						<div role="alert" class="alert alert-outline alert-warning">
							<span>⚠ Recorte(s) con tamaño insuficiente</span>
						</div>
					{/if}

					{#if editorConfig.showDisableAllVariantsButton || editorConfig.showGeneratedCrops}
						<div class="flex gap-2">
							{#if editorConfig.showDisableAllVariantsButton}
								<button
									type="button"
									class="sic-disable-all-variants btn btn-outline btn-sm btn-error flex-1"
									onclick={() => onRemoveAllCropBoxes()}
								>
									<CustomMiniCancel class="size-5" /><span>Desactivar todos</span>
								</button>
							{/if}
							{#if editorConfig.showGeneratedCrops}
								<button
									type="button"
									class="btn btn-outline btn-sm btn-success flex-1"
									disabled={hasLowResolutionCrops}
									onclick={() => onGenerateCrops()}
								>
									<Album class="size-5" /><span>Generar todos</span>
								</button>
							{/if}
						</div>
					{/if}
				{/if}
			</div>
		</div>

		<!-- Generated Crops Display -->
		{#if editorConfig.showGeneratedCrops}
			<details
				class="sic-generated-crops-accordion collapse-open bg-base-100 collapse mt-2 border border-zinc-700"
				class:collapse-arrow={generatedCrops.length > 0}
				name="generated-crops-accordion"
				open
			>
				<summary class="collapse-title flex items-center justify-between">
					<span class="text-sm">Crops generados ({generatedCrops.length})</span>
					{#if generatedCrops.length > 0 && editorConfig.showCropDeleteButtons}
						<button
							type="button"
							class="sic-generated-crop-delete-all btn btn-soft btn-xs btn-error"
							onclick={() => onDeleteAllGeneratedCrops()}
						>
							<TrashBinTrash class="size-5" /><span>Eliminar todos los crops generados</span>
						</button>
					{/if}
				</summary>
				{#if generatedCrops.length > 0}
					<div class="collapse-content grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
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
			</details>
		{/if}
	</div>
{:else}
	<div
		class="sic-empty-state flex min-h-24 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-zinc-700 p-6 text-center"
	>
		<p class="text-zinc-400">No hay ninguna imagen cargada</p>
		{#if editorConfig.showFileUpload}
			<input
				type="file"
				class="file-input"
				accept="image/*"
				name={fileInputName}
				onchange={onFileUpload}
			/>
		{/if}
	</div>
{/if}
