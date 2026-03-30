<script lang="ts">
	import SicDraggableImage from './SicDraggableImage.svelte';
	import SicCropBox from './SicCropBox.svelte';
	import { onMount } from 'svelte';
	import type {
		ActiveCropBox,
		EditorConfig
	} from '$lib/components/backoffice/SvelteImageCrop/types/imageEditorTypes';

	let {
		activeCropBoxes = [],
		wrapperClass,
		imageSrc,
		initialX = 0,
		initialY = 0,
		selectedCropBoxId = null,
		editorConfig = {},
		onPositionChange,
		onCropBoxUpdate,
		onCropBoxRemove,
		onCropBoxSelect,
		onCropBoxDragEnd,
		onCropBoxReset
	}: {
		activeCropBoxes?: ActiveCropBox[];
		wrapperClass: string;
		imageSrc: string;
		initialX?: number;
		initialY?: number;
		selectedCropBoxId?: string | null;
		editorConfig?: EditorConfig;
		onPositionChange?: (event: CustomEvent) => void;
		onCropBoxUpdate?: (event: CustomEvent) => void;
		onCropBoxRemove?: (event: CustomEvent) => void;
		onCropBoxSelect?: (event: CustomEvent) => void;
		onCropBoxDragEnd?: () => void;
		onCropBoxReset?: (event: CustomEvent) => void;
	} = $props();

	// Variables internas de transformación
	let flipH = $state(false);
	let flipV = $state(false);
	let rotation = $state(0);
	let zoom = $state(1);
	let previousZoom = $state(1);

	// eslint-disable-next-line svelte/no-top-level-browser-globals
	let containerElement = $state<HTMLDivElement>();
	let containerHeight = $state(0);
	let containerWidth = $state(0);
	let draggableImageComponent = $state<object | undefined>();
	// eslint-disable-next-line svelte/no-top-level-browser-globals
	let imageElement = $state<HTMLImageElement>();
	// eslint-disable-next-line svelte/prefer-writable-derived -- mutated by drag, resize, zoom
	let imageX = $state(0);
	// eslint-disable-next-line svelte/prefer-writable-derived -- mutated by drag, resize, zoom
	let imageY = $state(0);
	let previousContainerHeight = $state(0);
	let previousContainerWidth = $state(0);
	let imageLoadCount = $state(0);

	$effect(() => {
		imageX = initialX;
	});

	$effect(() => {
		imageY = initialY;
	});

	// Track image load events so that $derived.by blocks that read
	// naturalWidth/naturalHeight (non-reactive DOM props) recompute on each new load.
	$effect(() => {
		const el = imageElement;
		if (!el) return;
		const handler = () => {
			imageLoadCount++;
		};
		el.addEventListener('load', handler);
		return () => el.removeEventListener('load', handler);
	});

	// Calculate image bounds for constraining crops
	let imageBounds = $derived.by(() => {
		void imageLoadCount; // reactive trigger: recompute when a new image loads
		if (!imageElement || !containerWidth || !containerHeight) {
			return { x: 0, y: 0, width: containerWidth, height: containerHeight };
		}

		const imgAspectRatio = imageElement.naturalWidth / imageElement.naturalHeight;
		const containerAspectRatio = containerWidth / containerHeight;

		let displayWidth: number;
		let displayHeight: number;

		if (imgAspectRatio > containerAspectRatio) {
			displayWidth = containerWidth * zoom;
			displayHeight = (containerWidth / imgAspectRatio) * zoom;
		} else {
			displayHeight = containerHeight * zoom;
			displayWidth = containerHeight * imgAspectRatio * zoom;
		}

		// Center of container + image offset
		const centerX = containerWidth / 2;
		const centerY = containerHeight / 2;

		return {
			x: centerX + imageX - displayWidth / 2,
			y: centerY + imageY - displayHeight / 2,
			width: displayWidth,
			height: displayHeight
		};
	});

	/**
	 * Obtiene el elemento de imagen HTML y sus dimensiones
	 * Usado para la generación de crops
	 */
	export function getImageData() {
		if (!imageElement) {
			// Image not ready yet - this is expected during initial load
			console.warn('⚠️ imageElement is not available yet');
			return null;
		}

		const img = imageElement;

		// La imagen usa object-fit: contain, así que necesitamos calcular
		// las dimensiones reales de cómo se muestra, no las del contenedor
		const imgAspectRatio = img.naturalWidth / img.naturalHeight;
		const containerAspectRatio = containerWidth / containerHeight;

		let actualDisplayWidth: number;
		let actualDisplayHeight: number;

		if (imgAspectRatio > containerAspectRatio) {
			// La imagen es más ancha - se ajusta por el ancho
			actualDisplayWidth = containerWidth;
			actualDisplayHeight = containerWidth / imgAspectRatio;
		} else {
			// La imagen es más alta - se ajusta por la altura
			actualDisplayHeight = containerHeight;
			actualDisplayWidth = containerHeight * imgAspectRatio;
		}

		// Aplicar el zoom
		const displayWidth = actualDisplayWidth * zoom;
		const displayHeight = actualDisplayHeight * zoom;

		return {
			element: img,
			displayWidth,
			displayHeight,
			containerWidth,
			containerHeight
		};
	}

	onMount(() => {
		updateContainerSize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});

	function updateContainerSize(): void {
		if (containerElement) {
			const newWidth = containerElement.clientWidth;
			const newHeight = containerElement.clientHeight;

			if (previousContainerWidth === 0) {
				// Primera vez, solo guardar dimensiones
				previousContainerWidth = newWidth;
				previousContainerHeight = newHeight;
			}

			containerWidth = newWidth;
			containerHeight = newHeight;
		}
	}

	function handleResize(): void {
		if (containerElement) {
			const newWidth = containerElement.clientWidth;
			const newHeight = containerElement.clientHeight;

			if (previousContainerWidth > 0 && previousContainerHeight > 0) {
				// Calcular factor de escala
				const scaleX = newWidth / previousContainerWidth;
				const scaleY = newHeight / previousContainerHeight;

				// Actualizar posición de la imagen proporcionalmente
				imageX = imageX * scaleX;
				imageY = imageY * scaleY;

				// Actualizar posiciones y tamaños de los crop boxes proporcionalmente
				activeCropBoxes = activeCropBoxes.map((cropBox) => ({
					...cropBox,
					x: cropBox.x * scaleX,
					y: cropBox.y * scaleY,
					width: cropBox.width * scaleX,
					height: cropBox.height * scaleY
				}));

				// Notificar al padre de los cambios en los crop boxes
				activeCropBoxes.forEach((cropBox) => {
					onCropBoxUpdate?.({
						detail: {
							instanceId: cropBox.instanceId,
							x: cropBox.x,
							y: cropBox.y,
							width: cropBox.width,
							height: cropBox.height
						}
					} as CustomEvent);
				});
			}

			// Guardar nuevas dimensiones para la próxima vez
			previousContainerWidth = newWidth;
			previousContainerHeight = newHeight;
			containerWidth = newWidth;
			containerHeight = newHeight;
		}
	}

	function handlePositionChange(data: { x: number; y: number }): void {
		imageX = data.x;
		imageY = data.y;
		// Call position change callback
		onPositionChange?.({ detail: { x: imageX, y: imageY } } as CustomEvent);
	}

	function handleCropBoxUpdate(
		instanceId: string,
		data: { x: number; y: number; width: number; height: number }
	): void {
		onCropBoxUpdate?.({ detail: { instanceId, ...data } } as CustomEvent);
	}

	function handleCropBoxRemove(instanceId: string): void {
		onCropBoxRemove?.({ detail: { instanceId } } as CustomEvent);
	}

	function handleCropBoxDragEnd(): void {
		onCropBoxDragEnd?.();
	}

	// Funciones de control de transformaciones
	function rotateBy(degrees: number): void {
		rotation = rotation + degrees;
		// Mantener en el rango -180 a 180
		while (rotation > 180) rotation -= 360;
		while (rotation < -180) rotation += 360;
	}

	function resetRotation(): void {
		rotation = 0;
	}

	function resetZoom(): void {
		zoom = 1;
		imageX = 0;
		imageY = 0;
	}

	function resetAll(): void {
		rotation = 0;
		zoom = 1;
		imageX = 0;
		imageY = 0;
		flipH = false;
		flipV = false;
	}

	// Exponer función de reset para uso externo
	export function reset(): void {
		resetAll();
	}

	// Resolves when the image is fully loaded (naturalWidth > 0), or immediately if already loaded
	export function waitForImageReady(): Promise<void> {
		return new Promise((resolve) => {
			if (!imageElement) {
				resolve();
				return;
			}
			if (imageElement.naturalWidth > 0) {
				resolve();
				return;
			}
			imageElement.addEventListener('load', () => resolve(), { once: true });
		});
	}

	// Always waits for the next load event, regardless of current state.
	// Use this after setting a new image src, when the previous image may already be loaded.
	export function waitForImageLoad(): Promise<void> {
		return new Promise((resolve) => {
			if (!imageElement) {
				resolve();
				return;
			}
			imageElement.addEventListener('load', () => resolve(), { once: true });
		});
	}

	// Returns current image bounds in container coords, or null if image not loaded yet
	export function getImageBounds() {
		if (!imageElement || !imageElement.naturalWidth || !imageElement.naturalHeight) {
			return null;
		}
		return imageBounds;
	}

	// Returns scale factors to check crop resolution (natural px per container px)
	// Returns null if image not loaded yet
	export function getCropResolutionInfo() {
		if (
			!imageElement?.naturalWidth ||
			!imageElement?.naturalHeight ||
			!imageBounds.width ||
			!imageBounds.height
		) {
			return null;
		}
		return {
			scaleX: imageElement.naturalWidth / imageBounds.width,
			scaleY: imageElement.naturalHeight / imageBounds.height
		};
	}

	// Exponer función para obtener el estado de las transformaciones
	export function getTransformState() {
		return {
			rotation,
			zoom,
			flipH,
			flipV,
			imageX,
			imageY
		};
	}

	// Aplicar transformaciones desde un estado guardado
	export function applyTransform(modifications: {
		rotation: number;
		flipH: boolean;
		flipV: boolean;
		scale?: number;
		x?: number;
		y?: number;
	}): void {
		rotation = modifications.rotation;
		flipH = modifications.flipH;
		flipV = modifications.flipV;
		if (modifications.scale !== undefined) {
			zoom = modifications.scale;
		}
		if (modifications.x !== undefined) {
			imageX = modifications.x;
		}
		if (modifications.y !== undefined) {
			imageY = modifications.y;
		}
	}

	function handleWheel(event: WheelEvent): void {
		event.preventDefault();

		// Determinar dirección del scroll
		const delta = event.deltaY;
		const zoomStep = 0.05;

		// Calcular nuevo zoom
		let newZoom = zoom;
		if (delta < 0) {
			// Scroll up - zoom in
			newZoom = Math.min(zoom + zoomStep, 3); // Max zoom 3x
		} else {
			// Scroll down - zoom out
			newZoom = Math.max(zoom - zoomStep, 0.1); // Min zoom 0.1x
		}

		// Actualizar zoom directamente
		zoom = newZoom;
	}

	// Escalar crop boxes proporcionalmente cuando cambia el zoom
	$effect(() => {
		if (zoom !== previousZoom && previousZoom !== 0) {
			const zoomFactor = zoom / previousZoom;

			// El centro de la imagen está en el centro del contenedor + offset (imageX, imageY)
			const imageCenterX = containerWidth / 2 + imageX;
			const imageCenterY = containerHeight / 2 + imageY;

			// Escalar desde el centro de la imagen
			activeCropBoxes = activeCropBoxes.map((cropBox) => {
				// Calcular posición relativa al centro de la imagen
				const relativeX = cropBox.x - imageCenterX;
				const relativeY = cropBox.y - imageCenterY;

				// Escalar la posición relativa
				const scaledRelativeX = relativeX * zoomFactor;
				const scaledRelativeY = relativeY * zoomFactor;

				// Convertir de vuelta a coordenadas absolutas
				return {
					...cropBox,
					x: imageCenterX + scaledRelativeX,
					y: imageCenterY + scaledRelativeY,
					width: cropBox.width * zoomFactor,
					height: cropBox.height * zoomFactor
				};
			});

			// Notify parent so its state stays in sync with zoomed coords
			activeCropBoxes.forEach((cropBox) => {
				onCropBoxUpdate?.({
					detail: {
						instanceId: cropBox.instanceId,
						x: cropBox.x,
						y: cropBox.y,
						width: cropBox.width,
						height: cropBox.height
					}
				} as CustomEvent);
			});

			previousZoom = zoom;
		} else if (previousZoom === 0) {
			previousZoom = zoom;
		}
	});
</script>

<div class="flex flex-col gap-2 {wrapperClass}">
	<!-- Controles de transformación -->
	{#if editorConfig.showZoomControls || editorConfig.showRotateControls || editorConfig.showFlipControls}
		<div class="align-end bg-base-200 flex flex-col justify-end gap-2 rounded-md p-4">
			{#if editorConfig.showZoomControls !== false}
				<div class="sic-zoom-tools flex flex-row items-center gap-2">
					<span class="text-semibold w-12 text-xs">Zoom</span>
					<input
						type="range"
						min="0"
						max="3"
						step="0.01"
						bind:value={zoom}
						class="range range-xs flex-1"
					/>
					<input
						type="number"
						min="0"
						max="3"
						step="0.1"
						bind:value={zoom}
						class="input input-xs w-16"
					/>
					<button type="button" class="btn btn-soft btn-xs btn-error" onclick={resetZoom}
						>Reset</button
					>
				</div>
			{/if}
			{#if editorConfig.showRotateControls !== false}
				<div class="sic-rotate-tools flex flex-row items-center justify-end gap-2">
					<span class="text-semibold w-12 text-xs">Rotación</span>
					<input
						type="range"
						min="-180"
						max="180"
						step="0.1"
						bind:value={rotation}
						disabled={!editorConfig.allowFreeRotate}
						class="range range-xs flex-1"
					/>
					<input
						type="number"
						min="-180"
						max="180"
						step="0.1"
						bind:value={rotation}
						readonly={!editorConfig.allowFreeRotate}
						class="input input-xs w-16"
					/>

					<div class="flex gap-2">
						<button type="button" class="btn btn-soft btn-xs" onclick={() => rotateBy(-90)}
							>-90°</button
						>
						<button type="button" class="btn btn-soft btn-xs" onclick={() => rotateBy(90)}
							>+90°</button
						>
						<button type="button" class="btn btn-soft btn-xs btn-error" onclick={resetRotation}
							>Reset</button
						>
					</div>
				</div>
			{/if}
			{#if editorConfig.showFlipControls !== false}
				<div class="sic-flip-tools flex flex-row items-center gap-2">
					<span class="text-semibold w-12 text-xs">Flip</span>
					<label class="flex cursor-pointer items-center gap-2 select-none">
						<input type="checkbox" class="toggle toggle-success toggle-xs" bind:checked={flipH} />
						<span class="label-text text-xs">Horizontal</span>
					</label>
					<label class="ml-4 flex cursor-pointer items-center gap-2 select-none">
						<input type="checkbox" class="toggle toggle-success toggle-xs" bind:checked={flipV} />
						<span class="label-text text-xs">Vertical</span>
					</label>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Contenedor de la imagen y crop boxes -->
	<div
		bind:this={containerElement}
		class="sic-image-viewport border-base-300 bg-base-200 relative w-full overflow-hidden rounded-md border"
		style="aspect-ratio: {editorConfig.aspectRatio ?? 1.5};"
		onwheel={editorConfig.showZoomControls === true ? handleWheel : undefined}
	>
		<SicDraggableImage
			bind:this={draggableImageComponent}
			bind:imageElement
			src={imageSrc}
			initialX={imageX}
			initialY={imageY}
			{rotation}
			{zoom}
			{flipH}
			{flipV}
			enableDrag={editorConfig.imageDrag ?? true}
			onPositionChange={handlePositionChange}
		/>

		{#each activeCropBoxes as activeCropBox (activeCropBox.instanceId)}
			{@const _scaleX =
				imageBounds.width > 0 && imageElement?.naturalWidth
					? imageElement.naturalWidth / imageBounds.width
					: 0}
			{@const _scaleY =
				imageBounds.height > 0 && imageElement?.naturalHeight
					? imageElement.naturalHeight / imageBounds.height
					: 0}
			{@const isLowResolution =
				_scaleX > 0 &&
				(activeCropBox.width * _scaleX < activeCropBox.crop.width ||
					activeCropBox.height * _scaleY < activeCropBox.crop.height)}
			<SicCropBox
				data={activeCropBox.crop}
				x={activeCropBox.x}
				y={activeCropBox.y}
				width={activeCropBox.width}
				height={activeCropBox.height}
				isSelected={selectedCropBoxId === activeCropBox.instanceId}
				zIndex={activeCropBox.zIndex}
				constrainToImage={editorConfig.constrainToImage ?? false}
				allowRemoveCrops={editorConfig.showCropDeleteButtons ?? false}
				{imageBounds}
				{isLowResolution}
				onUpdate={(data) => handleCropBoxUpdate(activeCropBox.instanceId, data)}
				onRemove={() => handleCropBoxRemove(activeCropBox.instanceId)}
				onSelect={() =>
					onCropBoxSelect?.({ detail: { instanceId: activeCropBox.instanceId } } as CustomEvent)}
				onDragEnd={handleCropBoxDragEnd}
				onReset={() =>
					onCropBoxReset?.({ detail: { instanceId: activeCropBox.instanceId } } as CustomEvent)}
			/>
		{/each}
	</div>
</div>
