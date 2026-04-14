<script lang="ts" module>
	/**
	 * @component SicImageEditor
	 *
	 * Main image editor component with multiple layouts and programmatic control.
	 * See README or TypeScript definitions for full API documentation.
	 */
</script>

<script lang="ts">
	import { onMount, tick, type Component } from 'svelte';

	// Layouts
	import SicLayoutDefault from './SicLayouts/SicLayoutDefault.svelte';
	import SicLayoutCompact from './SicLayouts/SicLayoutCompact.svelte';
	import SicLayoutTwoCols from './SicLayouts/SicLayoutTwoCols.svelte';
	import SicLayoutSingle from './SicLayouts/SicLayoutSingle.svelte';
	import SicLayoutMinimal from './SicLayouts/SicLayoutMinimal.svelte';
	import SicLayoutMinimalAuto from './SicLayouts/SicLayoutMinimalAuto.svelte';

	// Utils
	import {
		generateAllCrops,
		containerToNormalized,
		type ImageTransform,
		type GeneratedCrop
	} from '$lib/components/backoffice/SvelteImageCrop/utils/cropGenerator';
	import * as cropState from '$lib/components/backoffice/SvelteImageCrop/utils/cropStateManager';
	import * as serializer from '$lib/components/backoffice/SvelteImageCrop/utils/stateSerializer';
	import type {
		ImageData,
		Variant
	} from '$lib/components/backoffice/SvelteImageCrop/types/persistedStateTypes';
	import type {
		EditorLayout,
		EditorConfig,
		OutputConfig,
		SicImageEditorEvents,
		ActiveCropBox
	} from '$lib/components/backoffice/SvelteImageCrop/types/imageEditorTypes';
	import type {
		LayoutProps,
		EditorContainerApi
	} from '$lib/components/backoffice/SvelteImageCrop/types/layoutTypes';

	// Libs
	import { v4 as uuidv4 } from 'uuid';

	// Config
	import type { VariantDefinition } from '$lib/components/backoffice/SvelteImageCrop/types/variantsConfigTypes';

	// ===== PROPS =====

	let {
		// Image metadata (aligned with ImageData API)
		originalUrl = '',
		id = '',
		title = '',
		mimeType = '',
		altText = '',
		originalWidth = 0,
		originalHeight = 0,
		originalSizeBytes = undefined,
		// Editor configuration
		variantsConfig,
		layout = 'default',
		editorConfig = {},
		outputConfig = {},
		initialState = undefined,
		savedFocalPoints = undefined,
		wrapperClass = '',
		columnClass = 'w-[320px]',
		name = undefined,
		onimageUploaded = undefined,
		oncropsGenerated = undefined,
		onstateChange = undefined,
		oncropRegenerated = undefined,
		onready = undefined,
		onerror = undefined
	}: {
		// Image metadata (aligned with ImageData API)
		originalUrl?: string;
		id?: string;
		title?: string;
		mimeType?: string;
		altText?: string;
		originalWidth?: number;
		originalHeight?: number;
		originalSizeBytes?: number;
		// Editor configuration
		variantsConfig: VariantDefinition[];
		layout?: EditorLayout;
		editorConfig?: EditorConfig;
		outputConfig?: OutputConfig;
		initialState?: ImageData | undefined;
		/** Pre-saved focal points keyed by preset. When a crop is toggled on, it uses these to position instead of centering. */
		savedFocalPoints?: Record<string, { x: number; y: number; scale: number }>;
		wrapperClass?: string;
		columnClass?: string;
		name?: string;
		onimageUploaded?: (detail: SicImageEditorEvents['imageUploaded']) => void;
		oncropsGenerated?: (detail: SicImageEditorEvents['cropsGenerated']) => void;
		onstateChange?: (detail: SicImageEditorEvents['stateChange']) => void;
		oncropRegenerated?: (detail: SicImageEditorEvents['cropRegenerated']) => void;
		onready?: (detail: SicImageEditorEvents['ready']) => void;
		onerror?: (detail: SicImageEditorEvents['error']) => void;
	} = $props();

	// ===== INTERNAL STATE =====

	// Overrideable metadata — initialized from props, updated via setImageData()
	// Separate from the display props so setImageData() doesn't affect the rendered image
	/* eslint-disable svelte/prefer-writable-derived -- mutated by setImageData/loadState/setState */
	let internalId = $state('');
	let internalOriginalUrl = $state('');
	let internalOriginalSizeBytes = $state<number | undefined>(undefined);
	let internalTitle = $state('');
	let internalAltText = $state('');
	/* eslint-enable svelte/prefer-writable-derived */

	// Sync internal metadata from props
	$effect(() => {
		internalId = id;
	});
	$effect(() => {
		internalOriginalUrl = originalUrl;
	});
	$effect(() => {
		internalOriginalSizeBytes = originalSizeBytes;
	});
	$effect(() => {
		internalTitle = title;
	});
	$effect(() => {
		internalAltText = altText;
	});

	// Generate unique instance ID for this editor
	const instanceId = `sic-editor-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

	// Timestamps (aligned with ImageData API)
	let createdAt = $state<string>(new Date().toISOString());
	let updatedAt = $state<string>(new Date().toISOString());

	// Ensure every crop definition has a unique id
	let normalizedCrops = $derived(
		variantsConfig.map((crop) => ({
			...crop,
			id: crop.id || uuidv4()
		}))
	);

	// State variables
	let activeCropBoxes = $state<ActiveCropBox[]>([]);
	let generatedCrops = $state<GeneratedCrop[]>([]);
	let selectedCropBoxId = $state<string | null>(null);
	let nextZIndex = $state(1);
	let imageX = $state(0);
	let imageY = $state(0);
	let editorContainerComponent = $state<EditorContainerApi | undefined>();
	let manipulatingCropId = $state<string | null>(null);
	let pendingUploadPresets = $state<string[] | null>(null);

	// Merge editor config defaults
	let resolvedEditorConfig = $derived<EditorConfig>({
		aspectRatio: 1.5,
		allowFreeRotate: false,
		constrainToImage: false,
		deleteCropOnVariantDisable: false,
		disableVariantOnCropDelete: false,
		imageDrag: true,
		showCropDeleteButtons: false,
		showCropDownloadButton: false,
		showCropNewTabButton: false,
		showCropRefreshButton: false,
		showDisableAllVariantsButton: false,
		showFileUpload: true,
		showFlipControls: false,
		showGeneratedCrops: true,
		showRotateControls: false,
		showVariantToggleButton: false,
		...editorConfig
	});

	// Merge output config defaults
	let outputDefaults = $derived<OutputConfig>({
		includeBase64: false,
		imageFormat: 'image/jpeg',
		quality: 0.94,
		...outputConfig
	});

	// ===== LAYOUT COMPONENT MAPPING =====

	const layoutComponents: Record<EditorLayout, Component<LayoutProps>> = {
		default: SicLayoutDefault,
		compact: SicLayoutCompact,
		'two-cols': SicLayoutTwoCols,
		single: SicLayoutSingle,
		minimal: SicLayoutMinimal,
		'minimal-auto': SicLayoutMinimalAuto
	};

	let currentLayoutComponent = $derived(layoutComponents[layout]);

	let hasLowResolutionCrops = $derived.by(() => {
		if (!editorContainerComponent || activeCropBoxes.length === 0) return false;
		const resInfo = editorContainerComponent.getCropResolutionInfo();
		if (!resInfo) return false;
		return activeCropBoxes.some(
			(cropBox) =>
				cropBox.width * resInfo.scaleX < cropBox.crop.width ||
				cropBox.height * resInfo.scaleY < cropBox.crop.height
		);
	});

	let lowResolutionCropIds = $derived.by(() => {
		if (!editorContainerComponent || activeCropBoxes.length === 0) return new Set<string>();
		const resInfo = editorContainerComponent.getCropResolutionInfo();
		if (!resInfo) return new Set<string>();
		return new Set(
			activeCropBoxes
				.filter(
					(cropBox) =>
						cropBox.width * resInfo.scaleX < cropBox.crop.width ||
						cropBox.height * resInfo.scaleY < cropBox.crop.height
				)
				.map((cropBox) => cropBox.crop.id)
		);
	});

	let layoutProps = $derived({
		wrapperClass,
		columnClass,
		fileInputName: name,
		imageSrc: originalUrl,
		imageX,
		imageY,
		activeCropBoxes,
		selectedCropBoxId,
		normalizedCrops,
		generatedCrops,
		manipulatingCropId,
		hasLowResolutionCrops,
		lowResolutionCropIds,
		editorConfig: resolvedEditorConfig,
		onFileUpload: handleFileUpload,
		onPositionChange: handlePositionChange,
		onCropBoxUpdate: handleCropBoxUpdate,
		onCropBoxRemove: handleCropBoxRemove,
		onCropBoxSelect: handleCropBoxSelect,
		onCropBoxDragEnd: handleCropBoxDragEnd,
		onCropBoxReset: handleCropBoxReset,
		onToggleCropBox: handleToggleCropBox,
		onSelectCropBox: handleSelectCropBox,
		onRemoveAllCropBoxes: removeAllCropBoxes,
		onGenerateCrops: handleGenerateCrops,
		onDeleteAllGeneratedCrops: deleteAllGeneratedCrops,
		onRegenerateCrop: regenerateCrop,
		onDeleteGeneratedCrop: deleteGeneratedCrop
	});

	// ===== HELPER FUNCTIONS =====

	function cropsToVariants(
		activeCropBoxes: ActiveCropBox[],
		generatedCrops: GeneratedCrop[]
	): Variant[] {
		if (!editorContainerComponent) return [];

		const imgData = editorContainerComponent.getImageData();
		if (!imgData) return [];

		const effectiveOriginalWidth = originalWidth || imgData.element.naturalWidth;
		const effectiveOriginalHeight = originalHeight || imgData.element.naturalHeight;

		return activeCropBoxes.map((activeCropBox) => {
			const generated = generatedCrops.find((g) => g.id === activeCropBox.instanceId);

			const normalizedTopLeft = containerToNormalized(
				activeCropBox.x,
				activeCropBox.y,
				imgData.containerWidth,
				imgData.containerHeight,
				imgData.displayWidth,
				imgData.displayHeight,
				imageX,
				imageY
			);

			const normalizedBottomRight = containerToNormalized(
				activeCropBox.x + activeCropBox.width,
				activeCropBox.y + activeCropBox.height,
				imgData.containerWidth,
				imgData.containerHeight,
				imgData.displayWidth,
				imgData.displayHeight,
				imageX,
				imageY
			);

			const normWidth = normalizedBottomRight.x - normalizedTopLeft.x;
			const normHeight = normalizedBottomRight.y - normalizedTopLeft.y;

			const cropNaturalWidth = normWidth * effectiveOriginalWidth;
			const r = cropNaturalWidth / activeCropBox.crop.width;
			const rMax = Math.min(
				effectiveOriginalWidth / activeCropBox.crop.width,
				effectiveOriginalHeight / activeCropBox.crop.height
			);
			const scale = rMax !== 1 ? (r - 1) / (rMax - 1) : 0;

			const normalizedCoords = {
				x: normalizedTopLeft.x + normWidth / 2,
				y: normalizedTopLeft.y + normHeight / 2,
				width: normWidth,
				height: normHeight,
				scale
			};

			let sizeBytes: number | undefined;
			if (generated?.base64) {
				sizeBytes = Math.ceil((generated.base64.length * 3) / 4);
			}

			return {
				id: activeCropBox.instanceId,
				preset: activeCropBox.crop.preset,
				format: activeCropBox.crop.format,
				width: activeCropBox.crop.width,
				height: activeCropBox.crop.height,
				url: generated?.url ?? (outputDefaults.includeBase64 ? generated?.base64 : undefined),
				sizeBytes,
				normalizedCoords
			};
		});
	}

	function variantsToActiveCropBoxes(variants: Variant[]): void {
		if (!editorContainerComponent) {
			console.error('EditorContainer not initialized');
			return;
		}

		const imgData = editorContainerComponent.getImageData();
		if (!imgData) {
			console.error('Could not get image data');
			return;
		}

		const effectiveOriginalWidth = originalWidth || imgData.element.naturalWidth;
		const effectiveOriginalHeight = originalHeight || imgData.element.naturalHeight;

		const result = serializer.imageDataToEditorState(
			{
				id,
				title,
				altText,
				mimeType,
				originalUrl,
				originalWidth: effectiveOriginalWidth,
				originalHeight: effectiveOriginalHeight,
				originalSizeBytes,
				modifications: { rotation: 0, flipH: false, flipV: false },
				variants,
				createdAt,
				updatedAt
			},
			imgData.containerWidth,
			imgData.containerHeight,
			imgData.displayWidth,
			imgData.displayHeight,
			imageX,
			imageY,
			normalizedCrops
		);

		activeCropBoxes = result.activeCropBoxes;
		nextZIndex = result.nextZIndex;

		const generatedFromVariants: GeneratedCrop[] = variants
			.filter((variant) => variant.url)
			.map((variant) => ({
				id: variant.id,
				preset: variant.preset,
				format: variant.format,
				width: variant.width,
				height: variant.height,
				url: variant.url as string
			}));

		generatedCrops = generatedFromVariants;
	}

	// ===== PUBLIC METHODS =====

	export async function generateCrops(): Promise<GeneratedCrop[]> {
		return handleGenerateCrops();
	}

	export function getState(): ImageData {
		if (!editorContainerComponent) {
			throw new Error('EditorContainer not initialized');
		}

		const transformState = editorContainerComponent.getTransformState();
		const imgData = editorContainerComponent.getImageData();
		const effectiveOriginalWidth = originalWidth || imgData?.element.naturalWidth || 0;
		const effectiveOriginalHeight = originalHeight || imgData?.element.naturalHeight || 0;

		return {
			id: internalId,
			title: internalTitle,
			altText: internalAltText,
			mimeType,
			originalUrl: internalOriginalUrl,
			originalWidth: effectiveOriginalWidth,
			originalHeight: effectiveOriginalHeight,
			originalSizeBytes: internalOriginalSizeBytes,
			modifications: {
				rotation: transformState.rotation,
				flipH: transformState.flipH,
				flipV: transformState.flipV
			},
			variants: cropsToVariants(activeCropBoxes, generatedCrops),
			createdAt,
			updatedAt: new Date().toISOString()
		};
	}

	export function setImageData(
		data: Partial<Pick<ImageData, 'id' | 'originalUrl' | 'originalSizeBytes'>>
	): void {
		if (data.id !== undefined) internalId = data.id;
		if (data.originalUrl !== undefined) internalOriginalUrl = data.originalUrl;
		if (data.originalSizeBytes !== undefined) internalOriginalSizeBytes = data.originalSizeBytes;
	}

	export async function loadState(state: ImageData): Promise<void> {
		if (!editorContainerComponent) {
			console.error('EditorContainer not initialized');
			return;
		}

		if (state.originalUrl !== originalUrl) {
			originalUrl = state.originalUrl;
		}

		internalId = state.id;
		internalOriginalUrl = state.originalUrl;
		internalOriginalSizeBytes = state.originalSizeBytes;

		await editorContainerComponent.waitForImageReady();

		const imgData = editorContainerComponent.getImageData();
		if (!imgData) {
			console.error('Could not get image data');
			return;
		}

		// originalWidth/Height may be 0 if not stored by the server — fall back to natural dimensions
		const effectiveOriginalWidth = state.originalWidth || imgData.element.naturalWidth;
		const effectiveOriginalHeight = state.originalHeight || imgData.element.naturalHeight;
		const stateWithDims = {
			...state,
			originalWidth: effectiveOriginalWidth,
			originalHeight: effectiveOriginalHeight
		};

		const result = serializer.imageDataToEditorState(
			stateWithDims,
			imgData.containerWidth,
			imgData.containerHeight,
			imgData.displayWidth,
			imgData.displayHeight,
			imageX,
			imageY,
			normalizedCrops
		);

		activeCropBoxes = result.activeCropBoxes;
		nextZIndex = result.nextZIndex;

		const generatedFromVariants: GeneratedCrop[] = state.variants
			.filter((variant) => variant.url)
			.map((variant) => ({
				id: variant.id,
				preset: variant.preset,
				format: variant.format,
				width: variant.width,
				height: variant.height,
				url: variant.url as string
			}));

		generatedCrops = generatedFromVariants;

		if (state.modifications) {
			editorContainerComponent.applyTransform(state.modifications);
		}
	}

	export function setState(data: ImageData): void {
		if (!data.id || !data.originalUrl || !data.originalWidth || !data.originalHeight) {
			throw new Error(
				'Invalid ImageData: missing required fields (id, originalUrl, originalWidth, originalHeight)'
			);
		}

		if (data.originalUrl !== originalUrl) originalUrl = data.originalUrl;
		id = data.id;
		internalTitle = data.title;
		internalAltText = data.altText;
		mimeType = data.mimeType;
		originalWidth = data.originalWidth;
		originalHeight = data.originalHeight;
		originalSizeBytes = data.originalSizeBytes;

		createdAt = data.createdAt;
		updatedAt = data.updatedAt;

		if (editorContainerComponent && data.modifications) {
			editorContainerComponent.applyTransform(data.modifications);
		}

		variantsToActiveCropBoxes(data.variants);
	}

	export function reset(): void {
		activeCropBoxes = [];
		generatedCrops = [];
		selectedCropBoxId = null;
		nextZIndex = 1;
		manipulatingCropId = null;

		if (editorContainerComponent) {
			editorContainerComponent.reset();
		}
	}

	export function getGeneratedCrops(): GeneratedCrop[] {
		return generatedCrops;
	}

	export function addCropBox(crop: VariantDefinition): void {
		handleAddCropBox(crop);
	}

	export function removeCropBox(instanceId: string): void {
		activeCropBoxes = cropState.removeCropBox(activeCropBoxes, instanceId);
		if (selectedCropBoxId === instanceId) {
			selectedCropBoxId = null;
		}

		if (resolvedEditorConfig.disableVariantOnCropDelete) {
			generatedCrops = generatedCrops.filter((crop) => crop.id !== instanceId);
		}
	}

	export function getInstanceId(): string {
		return instanceId;
	}

	// ===== EVENT HANDLERS =====

	function handleFileUpload(event: Event): void {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];

		if (file && file.type.startsWith('image/')) {
			const reader = new FileReader();
			reader.onload = async (e) => {
				const result = e.target?.result;
				if (typeof result === 'string') {
					pendingUploadPresets = activeCropBoxes.map((c) => c.crop.preset);
					originalUrl = result;
					internalId = id;
					internalOriginalUrl = result;
					internalOriginalSizeBytes = file.size;
					reset();
					onimageUploaded?.({ imageSrc: result, file });
				}
			};
			reader.readAsDataURL(file);
		}
	}

	function handlePositionChange(event: CustomEvent<{ x: number; y: number }>): void {
		const deltaX = event.detail.x - imageX;
		const deltaY = event.detail.y - imageY;

		imageX = event.detail.x;
		imageY = event.detail.y;

		activeCropBoxes = cropState.moveCropBoxesWithImage(activeCropBoxes, deltaX, deltaY);
	}

	function getCenteredCropPosition(
		cropWidth: number,
		cropHeight: number
	): { x: number; y: number } {
		if (!editorContainerComponent) {
			return { x: 50, y: 50 };
		}

		const imageData = editorContainerComponent.getImageData();
		if (!imageData) {
			return { x: 50, y: 50 };
		}

		const transformState = editorContainerComponent.getTransformState();

		const imageCenterX = imageData.containerWidth / 2 + transformState.imageX;
		const imageCenterY = imageData.containerHeight / 2 + transformState.imageY;

		return {
			x: imageCenterX - cropWidth / 2,
			y: imageCenterY - cropHeight / 2
		};
	}

	function handleAddCropBox(crop: VariantDefinition): void {
		if (cropState.isCropBoxActive(activeCropBoxes, crop.id)) {
			return;
		}

		const aspectRatio = crop.width / crop.height;
		let initialWidth = 200;
		let initialHeight = initialWidth / aspectRatio;

		if (editorContainerComponent) {
			const bounds = editorContainerComponent.getImageBounds();
			if (bounds && bounds.width > 0 && bounds.height > 0) {
				if (bounds.width / bounds.height > aspectRatio) {
					initialHeight = bounds.height;
					initialWidth = initialHeight * aspectRatio;
				} else {
					initialWidth = bounds.width;
					initialHeight = initialWidth / aspectRatio;
				}
			}
		}

		// Use saved focalPoint position if available, otherwise center
		const fp = savedFocalPoints?.[crop.preset];
		let position: { x: number; y: number };

		if (fp && editorContainerComponent) {
			const imgData = editorContainerComponent.getImageData();
			const transformState = editorContainerComponent.getTransformState();

			if (imgData) {
				const imageCenterX = imgData.containerWidth / 2 + transformState.imageX;
				const imageCenterY = imgData.containerHeight / 2 + transformState.imageY;
				const imageLeft = imageCenterX - imgData.displayWidth / 2;
				const imageTop = imageCenterY - imgData.displayHeight / 2;

				// fp.x/y are normalized 0-1 (center of crop on the image)
				const cropCenterX = imageLeft + fp.x * imgData.displayWidth;
				const cropCenterY = imageTop + fp.y * imgData.displayHeight;

				position = {
					x: cropCenterX - initialWidth / 2,
					y: cropCenterY - initialHeight / 2
				};
			} else {
				position = getCenteredCropPosition(initialWidth, initialHeight);
			}
		} else {
			position = getCenteredCropPosition(initialWidth, initialHeight);
		}

		const newCropBox = cropState.createActiveCropBox(
			crop,
			position,
			initialWidth,
			initialHeight,
			nextZIndex++
		);
		activeCropBoxes = [...activeCropBoxes, newCropBox];
		selectedCropBoxId = newCropBox.instanceId;
	}

	function handleCropBoxUpdate(
		event: CustomEvent<{ instanceId: string; x: number; y: number; width: number; height: number }>
	): void {
		const { instanceId, x, y, width, height } = event.detail;
		activeCropBoxes = cropState.updateCropBoxGeometry(activeCropBoxes, instanceId, {
			x,
			y,
			width,
			height
		});
		manipulatingCropId = instanceId;
	}

	function handleCropBoxRemove(event: CustomEvent<{ instanceId: string }>): void {
		activeCropBoxes = cropState.removeCropBox(activeCropBoxes, event.detail.instanceId);
		if (selectedCropBoxId === event.detail.instanceId) {
			selectedCropBoxId = null;
		}

		if (resolvedEditorConfig.disableVariantOnCropDelete) {
			generatedCrops = generatedCrops.filter((crop) => crop.id !== event.detail.instanceId);
		}
	}

	function handleCropBoxSelect(event: CustomEvent<{ instanceId: string }>): void {
		const result = cropState.bringCropBoxToFront(
			activeCropBoxes,
			event.detail.instanceId,
			nextZIndex
		);
		activeCropBoxes = result.cropBoxes;
		nextZIndex = result.nextZIndex;
		selectedCropBoxId = event.detail.instanceId;
	}

	function handleCropBoxDragEnd(): void {
		manipulatingCropId = null;
	}

	function handleCropBoxReset(event: CustomEvent<{ instanceId: string }>): void {
		const { instanceId } = event.detail;
		const activeCropBox = activeCropBoxes.find((ac) => ac.instanceId === instanceId);
		if (!activeCropBox || !editorContainerComponent) return;

		const cropDef = activeCropBox.crop as VariantDefinition;
		const aspectRatio = cropDef.width / cropDef.height;
		let newWidth = 200;
		let newHeight = newWidth / aspectRatio;

		const bounds = editorContainerComponent.getImageBounds();
		if (bounds && bounds.width > 0 && bounds.height > 0) {
			if (bounds.width / bounds.height > aspectRatio) {
				newHeight = bounds.height;
				newWidth = newHeight * aspectRatio;
			} else {
				newWidth = bounds.width;
				newHeight = newWidth / aspectRatio;
			}
		}

		const position = getCenteredCropPosition(newWidth, newHeight);
		activeCropBoxes = cropState.updateCropBoxGeometry(activeCropBoxes, instanceId, {
			x: position.x,
			y: position.y,
			width: newWidth,
			height: newHeight
		});
	}

	function handleToggleCropBox(crop: VariantDefinition): void {
		const activeCropBox = activeCropBoxes.find((ac) => ac.crop.id === crop.id);

		if (activeCropBox) {
			activeCropBoxes = cropState.removeCropBox(activeCropBoxes, activeCropBox.instanceId);
			if (selectedCropBoxId === activeCropBox.instanceId) {
				selectedCropBoxId = null;
			}

			if (
				resolvedEditorConfig.disableVariantOnCropDelete ||
				resolvedEditorConfig.deleteCropOnVariantDisable
			) {
				generatedCrops = generatedCrops.filter((c) => c.id !== activeCropBox.instanceId);
			}
		} else {
			handleAddCropBox(crop);
		}
	}

	function handleSelectCropBox(instanceId: string): void {
		const result = cropState.bringCropBoxToFront(activeCropBoxes, instanceId, nextZIndex);
		activeCropBoxes = result.cropBoxes;
		nextZIndex = result.nextZIndex;
		selectedCropBoxId = instanceId;
	}

	function removeAllCropBoxes(): void {
		if (resolvedEditorConfig.disableVariantOnCropDelete) {
			deleteAllGeneratedCrops();
		}

		activeCropBoxes = [];
		selectedCropBoxId = null;
	}

	function deleteGeneratedCrop(cropId: string): void {
		generatedCrops = generatedCrops.filter((crop) => crop.id !== cropId);

		if (resolvedEditorConfig.disableVariantOnCropDelete) {
			const activeCropBox = activeCropBoxes.find((ac) => ac.instanceId === cropId);
			if (activeCropBox) {
				activeCropBoxes = cropState.removeCropBox(activeCropBoxes, cropId);
				if (selectedCropBoxId === cropId) {
					selectedCropBoxId = null;
				}
			}
		}
	}

	function deleteAllGeneratedCrops(): void {
		if (resolvedEditorConfig.disableVariantOnCropDelete) {
			activeCropBoxes = [];
			selectedCropBoxId = null;
		}

		generatedCrops = [];
	}

	function regenerateCrop(cropId: string): void {
		if (!editorContainerComponent) {
			onerror?.({ message: 'EditorContainer not available' });
			return;
		}

		const activeCropBox = activeCropBoxes.find((ac) => ac.instanceId === cropId);
		if (!activeCropBox) {
			onerror?.({ message: 'Crop not found' });
			return;
		}

		const imageData = editorContainerComponent.getImageData();
		if (!imageData) {
			onerror?.({ message: 'Could not get image data' });
			return;
		}

		const transformState = editorContainerComponent.getTransformState();
		const transform: ImageTransform = {
			rotation: transformState.rotation,
			scale: transformState.zoom,
			flipH: transformState.flipH,
			flipV: transformState.flipV,
			x: transformState.imageX,
			y: transformState.imageY
		};

		try {
			const result = generateAllCrops(
				imageData.element,
				transform,
				[activeCropBox],
				{ width: imageData.containerWidth, height: imageData.containerHeight },
				{ width: imageData.displayWidth, height: imageData.displayHeight },
				outputDefaults.imageFormat ?? 'image/jpeg',
				outputDefaults.quality ?? 0.94
			);

			if (result.crops.length > 0) {
				const newCrop = result.crops[0];
				const existingIndex = generatedCrops.findIndex((c) => c.id === cropId);

				if (existingIndex >= 0) {
					generatedCrops[existingIndex] = newCrop;
					generatedCrops = [...generatedCrops];
				} else {
					generatedCrops = [...generatedCrops, newCrop];
				}

				oncropRegenerated?.({ crop: newCrop, cropId });
			}
		} catch (error) {
			onerror?.({
				message: 'Error regenerating crop',
				error: error instanceof Error ? error : undefined
			});
		}
	}

	function handleGenerateCrops(): GeneratedCrop[] {
		if (!editorContainerComponent) {
			onerror?.({ message: 'EditorContainer not available' });
			return [];
		}

		if (activeCropBoxes.length === 0) {
			onerror?.({ message: 'No crops to generate. Add at least one crop first.' });
			return [];
		}

		const imageData = editorContainerComponent.getImageData();
		if (!imageData) {
			onerror?.({ message: 'Could not get image data' });
			return [];
		}

		const transformState = editorContainerComponent.getTransformState();
		const transform: ImageTransform = {
			rotation: transformState.rotation,
			scale: transformState.zoom,
			flipH: transformState.flipH,
			flipV: transformState.flipV,
			x: transformState.imageX,
			y: transformState.imageY
		};

		try {
			const result = generateAllCrops(
				imageData.element,
				transform,
				activeCropBoxes,
				{ width: imageData.containerWidth, height: imageData.containerHeight },
				{ width: imageData.displayWidth, height: imageData.displayHeight },
				outputDefaults.imageFormat ?? 'image/jpeg',
				outputDefaults.quality ?? 0.94
			);

			generatedCrops = result.crops;

			const imageDataState = getState();

			oncropsGenerated?.({
				crops: result.crops,
				imageData: imageDataState,
				timestamp: result.timestamp
			});

			return result.crops;
		} catch (error) {
			console.error('Error in handleGenerateCrops:', error);
			onerror?.({
				message: 'Error generating crops',
				error: error instanceof Error ? error : undefined
			});
			return [];
		}
	}
	 

	// ===== LIFECYCLE =====

	$effect(() => {
		if (!editorContainerComponent || pendingUploadPresets === null) return;
		const presets = pendingUploadPresets;
		pendingUploadPresets = null;
		editorContainerComponent.waitForImageLoad().then(async () => {
			const cropsToActivate =
				presets.length > 0
					? normalizedCrops.filter((c) => presets.includes(c.preset))
					: !resolvedEditorConfig.showVariantToggleButton
						? normalizedCrops
						: [];
			for (const crop of cropsToActivate) handleAddCropBox(crop);
			if (cropsToActivate.length > 0) {
				await tick();
				handleGenerateCrops();
			}
		});
	});

	onMount(async () => {
		await tick();

		if (initialState) {
			await loadState(initialState);
		} else if (!resolvedEditorConfig.showVariantToggleButton) {
			await editorContainerComponent?.waitForImageReady();
			for (const crop of normalizedCrops) {
				handleAddCropBox(crop);
			}
		}

		onready?.({ instanceId, outputConfig, editorConfig });
	});
</script>

<!-- Dynamic Layout Rendering -->
{#if currentLayoutComponent}
	{@const LayoutComponent = currentLayoutComponent}
	<LayoutComponent
		bind:editorContainerComponent
		bind:title={internalTitle}
		bind:altText={internalAltText}
		{...layoutProps}
	/>
{/if}
