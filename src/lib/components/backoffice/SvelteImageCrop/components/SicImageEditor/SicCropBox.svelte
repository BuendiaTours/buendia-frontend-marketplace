<script lang="ts">
	import type { VariantDefinition } from '$lib/components/backoffice/SvelteImageCrop/types/variantsConfigTypes';
	import { calculateAspectRatio } from '$lib/components/backoffice/SvelteImageCrop/types/variantsConfigTypes';

	let {
		data,
		x = 0,
		y = 0,
		width = 200,
		height = 200,
		isSelected = false,
		zIndex = 1,
		constrainToImage = false,
		allowRemoveCrops = true,
		isLowResolution = false,
		imageBounds = { x: 0, y: 0, width: 0, height: 0 },
		onUpdate,
		onRemove,
		onSelect,
		onDragEnd,
		onReset
	}: {
		data: VariantDefinition;
		x?: number;
		y?: number;
		width?: number;
		height?: number;
		isSelected?: boolean;
		zIndex?: number;
		constrainToImage?: boolean;
		allowRemoveCrops?: boolean;
		isLowResolution?: boolean;
		imageBounds?: { x: number; y: number; width: number; height: number };
		onUpdate?: (data: { x: number; y: number; width: number; height: number }) => void;
		onRemove?: () => void;
		onSelect?: () => void;
		onDragEnd?: () => void;
		onReset?: () => void;
	} = $props();

	let isDragging = $state(false);
	let isResizing = $state(false);
	let resizeHandle = $state('');
	let startX = $state(0);
	let startY = $state(0);
	let startBoxX = $state(0);
	let startBoxY = $state(0);
	let startBoxWidth = $state(0);
	let startBoxHeight = $state(0);

	// Calculate aspect ratio for maintaining proportions during resize
	let aspectRatio = $derived(calculateAspectRatio(data.width, data.height));

	/**
	 * Constrains position and size to image bounds if enabled
	 */
	function applyConstraints(
		newX: number,
		newY: number,
		newWidth: number,
		newHeight: number
	): { x: number; y: number; width: number; height: number } {
		if (!constrainToImage) {
			return { x: newX, y: newY, width: newWidth, height: newHeight };
		}

		const minX = imageBounds.x;
		const minY = imageBounds.y;
		const maxX = imageBounds.x + imageBounds.width - newWidth;
		const maxY = imageBounds.y + imageBounds.height - newHeight;

		// Constrain position
		const constrainedX = Math.max(minX, Math.min(maxX, newX));
		const constrainedY = Math.max(minY, Math.min(maxY, newY));

		// Constrain size (can't be larger than image bounds)
		const constrainedWidth = Math.min(newWidth, imageBounds.width);
		const constrainedHeight = Math.min(newHeight, imageBounds.height);

		return {
			x: constrainedX,
			y: constrainedY,
			width: constrainedWidth,
			height: constrainedHeight
		};
	}

	function onMouseDownDrag(event: MouseEvent): void {
		if (isResizing) return;

		// Call selection callback
		onSelect?.();

		isDragging = true;
		startX = event.clientX;
		startY = event.clientY;
		startBoxX = x;
		startBoxY = y;
		event.preventDefault();
	}

	function onMouseDownResize(event: MouseEvent, handle: string): void {
		// Call selection callback
		onSelect?.();

		isResizing = true;
		resizeHandle = handle;
		startX = event.clientX;
		startY = event.clientY;
		startBoxX = x;
		startBoxY = y;
		startBoxWidth = width;
		startBoxHeight = height;
		event.preventDefault();
		event.stopPropagation();
	}

	function onMouseMove(event: MouseEvent): void {
		if (isDragging) {
			const deltaX = event.clientX - startX;
			const deltaY = event.clientY - startY;

			let newX = startBoxX + deltaX;
			let newY = startBoxY + deltaY;

			// Apply constraints if enabled
			const constrained = applyConstraints(newX, newY, width, height);
			x = constrained.x;
			y = constrained.y;

			// Call update callback during drag to update the UI
			onUpdate?.({ x, y, width, height });
		} else if (isResizing) {
			const deltaX = event.clientX - startX;
			// const deltaY = event.clientY - startY;

			let newWidth = startBoxWidth;
			let newHeight = startBoxHeight;
			let newX = startBoxX;
			let newY = startBoxY;

			// Calculate new dimensions based on handle
			switch (resizeHandle) {
				case 'se': // Bottom-right
					newWidth = startBoxWidth + deltaX;
					newHeight = newWidth / aspectRatio;
					break;
				case 'sw': // Bottom-left
					newWidth = startBoxWidth - deltaX;
					newHeight = newWidth / aspectRatio;
					newX = startBoxX + (startBoxWidth - newWidth);
					break;
				case 'ne': // Top-right
					newWidth = startBoxWidth + deltaX;
					newHeight = newWidth / aspectRatio;
					newY = startBoxY + (startBoxHeight - newHeight);
					break;
				case 'nw': // Top-left
					newWidth = startBoxWidth - deltaX;
					newHeight = newWidth / aspectRatio;
					newX = startBoxX + (startBoxWidth - newWidth);
					newY = startBoxY + (startBoxHeight - newHeight);
					break;
			}

			// Minimum size
			if (newWidth < 50 || newHeight < 50) return;

			// Apply constraints if enabled
			const constrained = applyConstraints(newX, newY, newWidth, newHeight);
			x = constrained.x;
			y = constrained.y;
			width = constrained.width;
			height = constrained.height;

			// Re-enforce aspect ratio if constraints broke it (width/height clipped independently)
			if (constrainToImage) {
				const expectedHeight = width / aspectRatio;
				if (Math.abs(height - expectedHeight) > 0.5) {
					const expectedWidth = height * aspectRatio;
					if (expectedHeight <= height) {
						height = expectedHeight;
					} else {
						width = expectedWidth;
					}
				}
			}

			// Call update callback during resize to update the UI
			onUpdate?.({ x, y, width, height });
		}
	}

	function onMouseUp(): void {
		if (isDragging || isResizing) {
			onUpdate?.({ x, y, width, height });
			onDragEnd?.();
		}
		isDragging = false;
		isResizing = false;
		resizeHandle = '';
	}
</script>

<svelte:window onmousemove={onMouseMove} onmouseup={onMouseUp} />

<div
	class="sic-crop-box group absolute box-border cursor-move select-none"
	class:cursor-grabbing={isDragging}
	style:background-color={isDragging || isResizing
		? 'rgba(255, 255, 255, 0.2)'
		: isSelected
			? 'rgba(255, 255, 255, 0.15)'
			: 'rgba(255, 255, 255, 0.1)'}
	style:opacity={isSelected ? '1' : '0.50'}
	style:z-index={zIndex}
	style="
    left: {x}px;
    top: {y}px;
    width: {width}px;
    height: {height}px;
  "
	onmousedown={onMouseDownDrag}
	ondblclick={(e) => {
		e.stopPropagation();
		onReset?.();
	}}
	role="button"
	tabindex="0"
>
	<div class="sic-crop-box-dashed-border pointer-events-none absolute inset-0 mix-blend-difference">
		<div class="absolute inset-0 border-2 border-black"></div>
		<div class="absolute inset-0 border-2 border-dashed border-white"></div>
	</div>
	<div
		class="sic-crop-box-info pointer-events-none absolute top-2 left-2 flex flex-col gap-0.5 rounded-xs bg-black p-2 whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-85"
	>
		<span class="text-xs font-semibold">{data.preset}</span>
		<span class="text-xs">
			{data.format} • {data.width}×{data.height}px
		</span>
	</div>

	{#if isLowResolution}
		<div class="tooltip absolute bottom-2 left-2" data-tip="Recorte demasiado pequeño">
			<span
				class="sic-crop-box-warning text-md btn btn-square btn-xs btn-warning text-black"
				title="Crop demasiado pequeño"><span class="blink">⚠</span></span
			>
		</div>
	{/if}

	{#if allowRemoveCrops}
		<button
			type="button"
			class="sic-crop-box-delete text-md btn btn-square btn-xs btn-error absolute top-2 right-2 text-white"
			onclick={onRemove}
			title="Eliminar crop">×</button
		>
	{/if}

	<!-- Resize handles -->
	<div
		class="boder-white absolute -top-1.25 -left-1.25 z-10 h-3 w-3 cursor-nw-resize rounded-full border-2 bg-white mix-blend-difference"
		onmousedown={(e) => onMouseDownResize(e, 'nw')}
		role="button"
		tabindex="-1"
	></div>
	<div
		class="boder-white absolute -top-1.25 -right-1.25 z-10 h-3 w-3 cursor-ne-resize rounded-full border-2 bg-white mix-blend-difference"
		onmousedown={(e) => onMouseDownResize(e, 'ne')}
		role="button"
		tabindex="-1"
	></div>
	<div
		class="boder-white absolute -bottom-1.25 -left-1.25 z-10 h-3 w-3 cursor-sw-resize rounded-full border-2 bg-white mix-blend-difference"
		onmousedown={(e) => onMouseDownResize(e, 'sw')}
		role="button"
		tabindex="-1"
	></div>
	<div
		class="boder-white absolute -right-1.25 -bottom-1.25 z-10 h-3 w-3 cursor-se-resize rounded-full border-2 bg-white mix-blend-difference"
		onmousedown={(e) => onMouseDownResize(e, 'se')}
		role="button"
		tabindex="-1"
	></div>
</div>

<style>
	.blink {
		animation: blinker 1s infinite;
	}

	@keyframes blinker {
		from {
			opacity: 1;
		}
		50% {
			opacity: 0.1;
		}
		to {
			opacity: 1;
		}
	}
</style>
