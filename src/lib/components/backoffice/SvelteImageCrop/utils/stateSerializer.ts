/**
 * Utilities for serializing/deserializing editor state
 *
 * Converts between:
 * - Editor state (ActiveCropBox[] with container coordinates)
 * - ImageData (server-compatible format with normalized coordinates 0-1)
 *
 * This allows saving the state to a database and restoring it later,
 * regardless of container size or display dimensions.
 */

import type { ActiveCropBox } from '$lib/components/backoffice/SvelteImageCrop/types/imageEditorTypes';
import type { VariantDefinition } from '$lib/components/backoffice/SvelteImageCrop/types/variantsConfigTypes';
import type {
	ImageData,
	Variant,
	NormalizedCoords
} from '$lib/components/backoffice/SvelteImageCrop/types/persistedStateTypes';
import type { GeneratedCrop } from '$lib/components/backoffice/SvelteImageCrop/utils/cropGenerator';
import {
	containerToNormalized,
	normalizedToImagePixels
} from '$lib/components/backoffice/SvelteImageCrop/utils/cropGenerator';
/**
 * Converts editor state to ImageData (for saving to server)
 *
 * This function takes the current state of the editor and converts it to
 * the server-compatible ImageData format with normalized coordinates.
 *
 * @param id - Unique UUID for the image
 * @param title - Image title
 * @param altText - Alt text for accessibility
 * @param mimeType - MIME type (e.g., "image/jpeg")
 * @param originalUrl - URL of the original image
 * @param imageNaturalWidth - Natural width of the image in pixels
 * @param imageNaturalHeight - Natural height of the image in pixels
 * @param originalSizeBytes - Original file size in bytes (optional)
 * @param modifications - Modifications state (rotation, flipH, flipV)
 * @param activeCropBoxes - Active crop boxes in the editor
 * @param generatedCrops - Generated crop results
 * @param containerWidth - Width of the editor container
 * @param containerHeight - Height of the editor container
 * @param imageDisplayWidth - Width of the displayed image
 * @param imageDisplayHeight - Height of the displayed image
 * @param imageX - X position of the image in the container
 * @param imageY - Y position of the image in the container
 * @returns ImageData ready to send to server
 */
export function editorStateToImageData(
	id: string,
	title: string,
	altText: string,
	mimeType: string,
	originalUrl: string,
	imageNaturalWidth: number,
	imageNaturalHeight: number,
	originalSizeBytes: number | undefined,
	modifications: {
		rotation: number;
		scale: number;
		flipH: boolean;
		flipV: boolean;
		x: number;
		y: number;
	},
	activeCropBoxes: ActiveCropBox[],
	generatedCrops: GeneratedCrop[],
	containerWidth: number,
	containerHeight: number,
	imageDisplayWidth: number,
	imageDisplayHeight: number,
	imageX: number,
	imageY: number
): ImageData {
	// Convert active crop boxes to variants
	const variants: Variant[] = activeCropBoxes.map((activeCropBox) => {
		// Find the generated crop to get the URL and sizeBytes (if exists)
		const generatedCrop = generatedCrops.find((gc) => gc.id === activeCropBox.instanceId);

		// Convert container coordinates to normalized coordinates (0-1)
		const normalizedTopLeft = containerToNormalized(
			activeCropBox.x,
			activeCropBox.y,
			containerWidth,
			containerHeight,
			imageDisplayWidth,
			imageDisplayHeight,
			imageX,
			imageY
		);

		const normalizedBottomRight = containerToNormalized(
			activeCropBox.x + activeCropBox.width,
			activeCropBox.y + activeCropBox.height,
			containerWidth,
			containerHeight,
			imageDisplayWidth,
			imageDisplayHeight,
			imageX,
			imageY
		);

		const normWidth = normalizedBottomRight.x - normalizedTopLeft.x;
		const normHeight = normalizedBottomRight.y - normalizedTopLeft.y;

		const cropNaturalWidth = normWidth * imageNaturalWidth;
		const r = cropNaturalWidth / activeCropBox.crop.width;
		const rMax = Math.min(
			imageNaturalWidth / activeCropBox.crop.width,
			imageNaturalHeight / activeCropBox.crop.height
		);
		const scale = rMax !== 1 ? (r - 1) / (rMax - 1) : 0;

		const normalizedCoords: NormalizedCoords = {
			x: normalizedTopLeft.x + normWidth / 2,
			y: normalizedTopLeft.y + normHeight / 2,
			width: normWidth,
			height: normHeight,
			scale
		};

		// Calculate sizeBytes from base64 if available
		let sizeBytes: number | undefined;
		if (generatedCrop?.base64) {
			// Base64 is ~33% larger than binary, so reverse the calculation
			sizeBytes = Math.ceil((generatedCrop.base64.length * 3) / 4);
		}

		return {
			id: activeCropBox.instanceId,
			preset: activeCropBox.crop.preset,
			format: activeCropBox.crop.format,
			width: activeCropBox.crop.width,
			height: activeCropBox.crop.height,
			url: generatedCrop?.url ?? generatedCrop?.base64,
			sizeBytes,
			normalizedCoords
		};
	});

	// Create ImageData
	const imageData: ImageData = {
		id,
		title,
		altText,
		mimeType,
		originalUrl,
		originalWidth: imageNaturalWidth,
		originalHeight: imageNaturalHeight,
		originalSizeBytes,
		modifications: {
			rotation: modifications.rotation,
			flipH: modifications.flipH,
			flipV: modifications.flipV
		},
		variants,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	};

	return imageData;
}

/**
 * Converts ImageData to editor state (for loading from server)
 *
 * This function takes ImageData (with normalized coordinates 0-1)
 * and converts it back to ActiveCropBox[] with container coordinates, ready to
 * be used in the editor.
 *
 * @param imageData - ImageData from server
 * @param containerWidth - Width of the editor container
 * @param containerHeight - Height of the editor container
 * @param imageDisplayWidth - Width of the displayed image
 * @param imageDisplayHeight - Height of the displayed image
 * @param imageX - X position of the image in the container
 * @param imageY - Y position of the image in the container
 * @param availableVariants - Array of available variants definitions
 * @returns Object with activeCropBoxes and nextZIndex
 */
export function imageDataToEditorState(
	imageData: ImageData,
	containerWidth: number,
	containerHeight: number,
	imageDisplayWidth: number,
	imageDisplayHeight: number,
	imageX: number,
	imageY: number,
	availableVariants: VariantDefinition[]
): { activeCropBoxes: ActiveCropBox[]; nextZIndex: number } {
	let nextZIndex = 1;

	// Convert variants to active crop boxes
	const activeCropBoxes: ActiveCropBox[] = imageData.variants.map((variant) => {
		// Find the crop definition by matching preset, format, width, and height
		let cropDef = availableVariants.find(
			(c) =>
				c.preset === variant.preset &&
				c.format === variant.format &&
				c.width === variant.width &&
				c.height === variant.height
		);

		if (!cropDef) {
			console.warn(
				`Crop definition not found for: ${variant.preset} ${variant.format} ${variant.width}x${variant.height}`
			);
			// Create a fallback crop definition
			cropDef = {
				id: variant.id,
				preset: variant.preset,
				format: variant.format,
				width: variant.width,
				height: variant.height
			};
		}

		// Convert normalized coordinates (center-based) to container coordinates
		// First derive top-left from center, then convert to image pixels
		const topLeftNormX = variant.normalizedCoords.x - variant.normalizedCoords.width / 2;
		const topLeftNormY = variant.normalizedCoords.y - variant.normalizedCoords.height / 2;

		const imageTopLeft = normalizedToImagePixels(
			topLeftNormX,
			topLeftNormY,
			imageData.originalWidth,
			imageData.originalHeight
		);

		const imageBottomRight = normalizedToImagePixels(
			topLeftNormX + variant.normalizedCoords.width,
			topLeftNormY + variant.normalizedCoords.height,
			imageData.originalWidth,
			imageData.originalHeight
		);

		// Calculate scale from image pixels to display pixels
		const scaleX = imageDisplayWidth / imageData.originalWidth;
		const scaleY = imageDisplayHeight / imageData.originalHeight;

		// Convert to display coordinates
		const displayTopLeft = {
			x: imageTopLeft.x * scaleX,
			y: imageTopLeft.y * scaleY
		};

		const displayBottomRight = {
			x: imageBottomRight.x * scaleX,
			y: imageBottomRight.y * scaleY
		};

		// Calculate position in container
		const imageCenterX = containerWidth / 2 + imageX;
		const imageCenterY = containerHeight / 2 + imageY;
		const imageLeft = imageCenterX - imageDisplayWidth / 2;
		const imageTop = imageCenterY - imageDisplayHeight / 2;

		const containerX = imageLeft + displayTopLeft.x;
		const containerY = imageTop + displayTopLeft.y;
		const containerWidth_crop = displayBottomRight.x - displayTopLeft.x;
		const containerHeight_crop = displayBottomRight.y - displayTopLeft.y;

		const activeCropBox: ActiveCropBox = {
			instanceId: variant.id,
			crop: {
				id: cropDef.id, // Use the crop definition ID from availableVariants for sidebar matching
				preset: cropDef.preset,
				format: cropDef.format,
				width: cropDef.width,
				height: cropDef.height
			},
			x: containerX,
			y: containerY,
			width: containerWidth_crop,
			height: containerHeight_crop,
			zIndex: nextZIndex++
		};

		return activeCropBox;
	});

	return {
		activeCropBoxes,
		nextZIndex
	};
}

/**
 * Creates an empty ImageData for a new image
 *
 * Useful for initializing the editor with a fresh image and no variants
 *
 * @param id - Unique UUID for the image
 * @param title - Image title
 * @param altText - Alt text for accessibility
 * @param mimeType - MIME type (e.g., "image/jpeg")
 * @param originalUrl - URL of the image
 * @param imageNaturalWidth - Natural width of the image
 * @param imageNaturalHeight - Natural height of the image
 * @param originalSizeBytes - Original file size in bytes (optional)
 * @returns Empty ImageData
 */
export function createEmptyImageData(
	id: string,
	title: string,
	altText: string,
	mimeType: string,
	originalUrl: string,
	imageNaturalWidth: number,
	imageNaturalHeight: number,
	originalSizeBytes?: number
): ImageData {
	return {
		id,
		title,
		altText,
		mimeType,
		originalUrl,
		originalWidth: imageNaturalWidth,
		originalHeight: imageNaturalHeight,
		originalSizeBytes,
		modifications: {
			rotation: 0,
			flipH: false,
			flipV: false
		},
		variants: [],
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	};
}

/**
 * Updates the timestamp in ImageData
 *
 * @param imageData - Current ImageData
 * @returns New ImageData with updated timestamp
 */
export function updateImageDataTimestamp(imageData: ImageData): ImageData {
	return {
		...imageData,
		updatedAt: new Date().toISOString()
	};
}
