/**
 * Demo helpers for SvelteImageCrop component
 *
 * These utilities are designed for demos, examples, and prototyping.
 * In production, you should receive ImageData from your API.
 */

import { v4 as uuidv4 } from 'uuid';
import type { ImageData } from '../types/persistedStateTypes';
import type { EditorConfig } from '../types/imageEditorTypes';

/**
 * Creates a demo ImageData object for testing and examples
 *
 * @example
 * ```typescript
 * const imageData = createDemoImageData({
 *   originalUrl: 'https://example.com/image.jpg',
 *   title: 'Product Photo',
 *   originalWidth: 2400,
 *   originalHeight: 1600
 * });
 * ```
 *
 * **Note:** In production, you'd receive ImageData from your API.
 * This helper is primarily for demos, prototyping, and testing.
 *
 * @param config - Configuration for the demo image
 * @returns Complete ImageData object ready to use with SicImageEditor
 */
export function createDemoImageData(config: {
	/** Image URL or data URL */
	originalUrl: string;
	/** Image title (default: "Demo Image") */
	title?: string;
	/** Alt text for accessibility (default: "Demo image for testing") */
	altText?: string;
	/** MIME type (default: "image/jpeg") */
	mimeType?: string;
	/** Original width in pixels (default: 2400) */
	originalWidth?: number;
	/** Original height in pixels (default: 1600) */
	originalHeight?: number;
	/** Original file size in bytes (optional) */
	originalSizeBytes?: number;
}): ImageData {
	const now = new Date().toISOString();

	return {
		id: uuidv4(),
		title: config.title ?? 'Demo Image',
		altText: config.altText ?? 'Demo image for testing',
		mimeType: config.mimeType ?? 'image/jpeg',
		originalUrl: config.originalUrl,
		originalWidth: config.originalWidth ?? 2400,
		originalHeight: config.originalHeight ?? 1600,
		originalSizeBytes: config.originalSizeBytes,
		modifications: {
			rotation: 0,
			flipH: false,
			flipV: false
		},
		variants: [],
		createdAt: now,
		updatedAt: now
	};
}

/**
 * Preset visibility configurations for common use cases
 *
 * Use these presets to quickly configure the editor for different scenarios.
 * You can still override individual properties using spread syntax:
 *
 * @example
 * ```svelte
 * <SicImageEditor
 *   visibility={{ ...VISIBILITY_PRESETS.COMPACT, showZoomControls: true }}
 * />
 * ```
 */
export const EDITOR_CONFIG_PRESETS = {
	/**
	 * Full-featured editor with all controls enabled
	 *
	 * Use for: Complete editing experience with maximum flexibility
	 */
	FULL_ALT: {
		showFileUpload: true,
		showZoomControls: true,
		showDisableAllVariantsButton: true,
		showRotateControls: true,
		allowFreeRotate: false,
		showFlipControls: true,
		constrainToImage: false,
		imageDrag: true,
		showCropRefreshButton: true,
		showCropNewTabButton: false,
		showCropDownloadButton: false,
		showCropDeleteButtons: false,
		showVariantToggleButton: true,
		deleteCropOnVariantDisable: true
	} satisfies EditorConfig,

	/**
	 * Full-featured editor with all controls enabled
	 *
	 * Use for: Complete editing experience with maximum flexibility
	 */
	FULL: {
		showFileUpload: true,
		showZoomControls: true,
		showDisableAllVariantsButton: false,
		showFlipControls: false,
		constrainToImage: false,
		imageDrag: true,
		showCropRefreshButton: true,
		showCropNewTabButton: true,
		showCropDownloadButton: true,
		showCropDeleteButtons: true
	} satisfies EditorConfig,

	/**
	 * Compact editor with essential controls only
	 *
	 * Use for: Simpler interface when you have 1-2 crops
	 */
	COMPACT: {
		showZoomControls: true,
		showRotateControls: false,
		allowFreeRotate: false,
		showFlipControls: false,
		constrainToImage: false,
		imageDrag: true,
		showCropRefreshButton: true,
		showCropNewTabButton: true,
		showCropDownloadButton: true,
		showCropDeleteButtons: true
	} satisfies EditorConfig,

	/**
	 * Minimal editor - image and crop only
	 *
	 * Use for: Focused cropping with crop constrained to image
	 */
	MINIMAL: {
		showZoomControls: false,
		showRotateControls: false,
		allowFreeRotate: false,
		showFlipControls: false,
		constrainToImage: true,
		imageDrag: false,
		showCropRefreshButton: true,
		showCropDeleteButtons: true
	} satisfies EditorConfig,

	/**
	 * Minimal auto - automatic crop, no user controls
	 *
	 * Use for: Fully automatic cropping workflows
	 */
	MINIMAL_AUTO: {
		showZoomControls: false,
		showRotateControls: false,
		allowFreeRotate: false,
		showFlipControls: false,
		constrainToImage: true,
		imageDrag: false
	} satisfies EditorConfig
} as const;
