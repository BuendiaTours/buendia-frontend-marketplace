/**
 * Pure state management functions for crop box manipulation
 *
 * All functions are pure - they take state as input and return new state
 * without side effects. This makes them easily testable and reusable.
 */

import type { ActiveCropBox } from '$lib/SvelteImageCrop/types/imageEditorTypes';
import type { VariantDefinition } from '$lib/SvelteImageCrop/types/variantsConfigTypes';

// Libs
import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique ID for a crop box instance
 */
export function generateCropInstanceId(): string {
	// return `crop-instance-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
	return uuidv4();
}

/**
 * Creates an ActiveCropBox from a CropDefinition
 *
 * @param crop - The crop definition (preset configuration)
 * @param position - Initial position in the container {x, y}
 * @param zIndex - Z-index for stacking order
 * @returns A new ActiveCropBox ready to be added to the editor
 */
export function createActiveCropBox(
	crop: VariantDefinition,
	position: { x: number; y: number },
	width: number,
	height: number,
	zIndex: number
): ActiveCropBox {
	const instanceId = generateCropInstanceId();

	return {
		instanceId,
		crop: {
			id: crop.id,
			preset: crop.preset,
			format: crop.format,
			width: crop.width,
			height: crop.height
		},
		x: position.x,
		y: position.y,
		width,
		height,
		zIndex
	};
}

/**
 * Checks if a crop box with the given id is already active
 *
 * @param activeCropBoxes - Current array of active crop boxes
 * @param cropId - Crop definition ID to check
 * @returns True if a crop box with this id is already active
 */
export function isCropBoxActive(activeCropBoxes: ActiveCropBox[], cropId: string): boolean {
	return activeCropBoxes.some((ac) => ac.crop.id === cropId);
}

/**
 * Finds an active crop box by its instance ID
 *
 * @param activeCropBoxes - Current array of active crop boxes
 * @param instanceId - Instance ID to find
 * @returns The active crop box if found, undefined otherwise
 */
export function findActiveCropBox(
	activeCropBoxes: ActiveCropBox[],
	instanceId: string
): ActiveCropBox | undefined {
	return activeCropBoxes.find((cropBox) => cropBox.instanceId === instanceId);
}

/**
 * Updates the geometry (position and/or size) of a crop box
 *
 * @param activeCropBoxes - Current array of active crop boxes
 * @param instanceId - ID of the crop box to update
 * @param updates - Partial updates to apply {x?, y?, width?, height?}
 * @returns New array with the updated crop box
 */
export function updateCropBoxGeometry(
	activeCropBoxes: ActiveCropBox[],
	instanceId: string,
	updates: Partial<{ x: number; y: number; width: number; height: number }>
): ActiveCropBox[] {
	return activeCropBoxes.map((cropBox) =>
		cropBox.instanceId === instanceId ? { ...cropBox, ...updates } : cropBox
	);
}

/**
 * Brings a crop box to the front by updating its z-index
 *
 * @param activeCropBoxes - Current array of active crop boxes
 * @param instanceId - ID of the crop box to bring to front
 * @param nextZIndex - The next available z-index value
 * @returns New array with updated crop box and the new nextZIndex value
 */
export function bringCropBoxToFront(
	activeCropBoxes: ActiveCropBox[],
	instanceId: string,
	nextZIndex: number
): { cropBoxes: ActiveCropBox[]; nextZIndex: number } {
	const updatedCropBoxes = activeCropBoxes.map((cropBox) =>
		cropBox.instanceId === instanceId ? { ...cropBox, zIndex: nextZIndex } : cropBox
	);

	return {
		cropBoxes: updatedCropBoxes,
		nextZIndex: nextZIndex + 1
	};
}

/**
 * Removes a crop box from the active crop boxes array
 *
 * @param activeCropBoxes - Current array of active crop boxes
 * @param instanceId - ID of the crop box to remove
 * @returns New array without the removed crop box
 */
export function removeCropBox(
	activeCropBoxes: ActiveCropBox[],
	instanceId: string
): ActiveCropBox[] {
	return activeCropBoxes.filter((cropBox) => cropBox.instanceId !== instanceId);
}

/**
 * Moves all crop boxes by a delta when the image is moved
 *
 * @param activeCropBoxes - Current array of active crop boxes
 * @param deltaX - Horizontal movement in pixels
 * @param deltaY - Vertical movement in pixels
 * @returns New array with all crop boxes moved
 */
export function moveCropBoxesWithImage(
	activeCropBoxes: ActiveCropBox[],
	deltaX: number,
	deltaY: number
): ActiveCropBox[] {
	return activeCropBoxes.map((cropBox) => ({
		...cropBox,
		x: cropBox.x + deltaX,
		y: cropBox.y + deltaY
	}));
}

/**
 * Scales all crop boxes when the container is resized
 *
 * This maintains the relative position and size of crop boxes when the
 * container dimensions change (e.g., window resize, responsive layout)
 *
 * @param activeCropBoxes - Current array of active crop boxes
 * @param scaleX - Horizontal scale factor (newWidth / oldWidth)
 * @param scaleY - Vertical scale factor (newHeight / oldHeight)
 * @returns New array with all crop boxes scaled
 */
export function scaleCropBoxesOnResize(
	activeCropBoxes: ActiveCropBox[],
	scaleX: number,
	scaleY: number
): ActiveCropBox[] {
	return activeCropBoxes.map((cropBox) => ({
		...cropBox,
		x: cropBox.x * scaleX,
		y: cropBox.y * scaleY,
		width: cropBox.width * scaleX,
		height: cropBox.height * scaleY
	}));
}

/**
 * Scales all crop boxes when the image is zoomed
 *
 * This scales crop boxes around the image center point, maintaining their
 * relative position to the image as it zooms in/out
 *
 * @param activeCropBoxes - Current array of active crop boxes
 * @param imageCenterX - X coordinate of the image center in the container
 * @param imageCenterY - Y coordinate of the image center in the container
 * @param zoomFactor - Zoom scale factor (newZoom / oldZoom)
 * @returns New array with all crop boxes scaled around the image center
 */
export function scaleCropBoxesOnZoom(
	activeCropBoxes: ActiveCropBox[],
	imageCenterX: number,
	imageCenterY: number,
	zoomFactor: number
): ActiveCropBox[] {
	return activeCropBoxes.map((cropBox) => {
		// Calculate position relative to image center
		const relativeX = cropBox.x - imageCenterX;
		const relativeY = cropBox.y - imageCenterY;

		// Scale position and size
		const newRelativeX = relativeX * zoomFactor;
		const newRelativeY = relativeY * zoomFactor;

		return {
			...cropBox,
			x: imageCenterX + newRelativeX,
			y: imageCenterY + newRelativeY,
			width: cropBox.width * zoomFactor,
			height: cropBox.height * zoomFactor
		};
	});
}

/**
 * Removes all crop boxes with a specific crop definition ID
 *
 * @param activeCropBoxes - Current array of active crop boxes
 * @param cropId - Crop definition ID to remove
 * @returns New array without crop boxes of the specified ID
 */
export function removeCropBoxesById(
	activeCropBoxes: ActiveCropBox[],
	cropId: string
): ActiveCropBox[] {
	return activeCropBoxes.filter((cropBox) => cropBox.crop.id !== cropId);
}

/**
 * Gets the crop box with the highest z-index
 *
 * @param activeCropBoxes - Current array of active crop boxes
 * @returns The crop box with the highest z-index, or undefined if array is empty
 */
export function getTopCropBox(activeCropBoxes: ActiveCropBox[]): ActiveCropBox | undefined {
	if (activeCropBoxes.length === 0) return undefined;

	return activeCropBoxes.reduce((top, current) => (current.zIndex > top.zIndex ? current : top));
}

/**
 * Gets the next available z-index value
 *
 * @param activeCropBoxes - Current array of active crop boxes
 * @returns The next z-index value (highest + 1, or 1 if no crop boxes)
 */
export function getNextZIndex(activeCropBoxes: ActiveCropBox[]): number {
	if (activeCropBoxes.length === 0) return 1;

	const maxZIndex = Math.max(...activeCropBoxes.map((cropBox) => cropBox.zIndex));
	return maxZIndex + 1;
}
