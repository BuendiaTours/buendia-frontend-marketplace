/**
 * Svelte Image Crop - Public API
 *
 * Main entry point for the image crop editor library.
 * Import components, utilities, and types from this file.
 */

// ===== MAIN COMPONENTS =====

/**
 * Main wrapper component - use this for most use cases
 * @example
 * ```svelte
 * <SicImageEditor
 *   originalUrl="/image.jpg"
 *   id="123"
 *   title="Product"
 *   mimeType="image/jpeg"
 *   altText="Product image"
 *   variantsConfig={crops}
 *   oncropsGenerated={(e) => sendToServer(e.detail.imageData)}
 * />
 * ```
 */
export { default as SicImageEditor } from './components/SicImageEditor.svelte';

/**
 * Low-level components - use these for custom implementations
 */
export { default as SicEditorContainer } from './components/SicImageEditor/SicEditorContainer.svelte';
export { default as SicCropVariant } from './components/SicImageEditor/SicCropVariant.svelte';
export { default as SicGeneratedCrop } from './components/SicImageEditor/SicGeneratedCrop.svelte';
export { default as SicCropBox } from './components/SicImageEditor/SicCropBox.svelte';
export { default as SicDraggableImage } from './components/SicImageEditor/SicDraggableImage.svelte';

// ===== UTILITIES =====

/**
 * Crop state management utilities
 * Pure functions for managing crop state
 */
export * from './utils/cropStateManager';

/**
 * State serialization utilities
 * Convert between editor state and persisted state
 */
export * from './utils/stateSerializer';

/**
 * Crop generation utilities
 * Core functions for generating crop images
 */
export {
	generateAllCrops,
	generateCropCanvas,
	createTransformedCanvas,
	canvasToBase64,
	containerToNormalized,
	normalizedToImagePixels,
	containerSizeToImageSize,
	type ImageInfo,
	type ImageTransform, // Internal transform type (includes scale, x, y for editor UI)
	type ContainerDimensions,
	type CropArea,
	type CropDimensions,
	type GeneratedCrop,
	type CropGenerationResult
} from './utils/cropGenerator';

// ===== TYPES =====

/**
 * Image editor types
 * Props, events, and instance types for SicImageEditor
 */
export type {
	EditorLayout,
	EditorConfig,
	OutputConfig,
	SicImageEditorEvents,
	SicImageEditorInstance,
	ActiveCropBox
} from './types/imageEditorTypes';

/**
 * Crop configuration types
 * Crop definitions and utilities
 */
export type { VariantDefinition as CropDefinition } from './types/variantsConfigTypes';
export {
	parseAspectRatio,
	calculateAspectRatio,
	formatAspectRatio
} from './types/variantsConfigTypes';

/**
 * Image data types
 * Server-compatible types for saving and restoring editor state
 */
export type {
	NormalizedCoords,
	Modifications,
	Variant,
	ImageData
} from './types/persistedStateTypes';
export {
	absoluteToNormalized,
	normalizedToAbsolute,
	cornerToCenter,
	centerToCorner,
	validateNormalizedCoords
} from './types/persistedStateTypes';
