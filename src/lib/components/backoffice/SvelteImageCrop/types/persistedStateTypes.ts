/**
 * Data types aligned with server API structure
 *
 * This structure matches the server API format to simplify data exchange.
 * No conversion functions needed - data can be sent/received directly.
 */

/**
 * Normalized coordinates (0-1) relative to original image
 */
export type NormalizedCoords = {
	x: number; // center X (0 = left, 1 = right)
	y: number; // center Y (0 = top, 1 = bottom)
	width: number; // 0-1 of image width
	height: number; // 0-1 of image height
	scale?: number; // 0 = 1:1 pixel mapping, 1 = max coverage, <0 = upscaling needed
};

/**
 * Image modifications (transformations applied in editor)
 */
export type Modifications = {
	rotation: number; // Rotation in degrees (0-360)
	flipH: boolean; // Horizontal flip
	flipV: boolean; // Vertical flip
};

/**
 * Image variant (crop)
 *
 * Matches server API variant structure
 */
export type Variant = {
	id: string; // Unique UUID for this variant instance
	preset: string; // Preset identifier (e.g., "HERO_DESKTOP", "CARD")
	format: string; // Image format (WEBP, JPEG, PNG)
	width: number; // Final width in pixels
	height: number; // Final height in pixels
	url?: string; // URL of generated variant (optional, set after upload)
	sizeBytes?: number; // Size in bytes (optional)
	normalizedCoords: NormalizedCoords; // Position and size relative to original image
};

/**
 * Complete image data with variants
 *
 * This is the main data structure that matches the server API format.
 * It contains all information needed to persist and restore image state.
 */
export type ImageData = {
	id: string; // Unique UUID for the image
	title: string; // Image title
	altText: string; // Alt text for accessibility
	mimeType: string; // MIME type (e.g., "image/jpeg")
	originalUrl: string; // URL of original image
	originalWidth: number; // Original width in pixels
	originalHeight: number; // Original height in pixels
	originalSizeBytes?: number; // Original file size in bytes (optional)
	modifications: Modifications; // Transformations applied
	variants: Variant[]; // Image variants (crops)
	createdAt: string; // Creation timestamp (ISO 8601)
	updatedAt: string; // Last update timestamp (ISO 8601)
};

/**
 * Converts absolute coordinates (top-left origin) to normalized (0-1, center origin)
 */
export function absoluteToNormalized(
	absolute: { x: number; y: number; width: number; height: number },
	imageWidth: number,
	imageHeight: number
): NormalizedCoords {
	const w = absolute.width / imageWidth;
	const h = absolute.height / imageHeight;
	return {
		x: absolute.x / imageWidth + w / 2,
		y: absolute.y / imageHeight + h / 2,
		width: w,
		height: h
	};
}

/**
 * Converts normalized coordinates (0-1, center origin) to absolute (top-left origin)
 */
export function normalizedToAbsolute(
	normalizedCoords: NormalizedCoords,
	imageWidth: number,
	imageHeight: number
): { x: number; y: number; width: number; height: number } {
	const w = normalizedCoords.width * imageWidth;
	const h = normalizedCoords.height * imageHeight;
	return {
		x: normalizedCoords.x * imageWidth - w / 2,
		y: normalizedCoords.y * imageHeight - h / 2,
		width: w,
		height: h
	};
}

/**
 * Converts position from top-left corner to center
 */
export function cornerToCenter(
	cornerX: number,
	cornerY: number,
	width: number,
	height: number
): { x: number; y: number } {
	return {
		x: cornerX + width / 2,
		y: cornerY + height / 2
	};
}

/**
 * Converts position from center to top-left corner
 */
export function centerToCorner(
	centerX: number,
	centerY: number,
	width: number,
	height: number
): { x: number; y: number } {
	return {
		x: centerX - width / 2,
		y: centerY - height / 2
	};
}

/**
 * Validates that normalized coordinates (center-based) are within bounds
 */
export function validateNormalizedCoords(coords: NormalizedCoords): boolean {
	const halfW = coords.width / 2;
	const halfH = coords.height / 2;
	return (
		coords.width >= 0 &&
		coords.width <= 1 &&
		coords.height >= 0 &&
		coords.height <= 1 &&
		coords.x - halfW >= 0 &&
		coords.x + halfW <= 1 &&
		coords.y - halfH >= 0 &&
		coords.y + halfH <= 1
	);
}
