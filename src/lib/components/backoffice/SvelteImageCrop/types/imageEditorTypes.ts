/**
 * Type definitions for the SicImageEditor wrapper component
 *
 * These types define the public API of the image editor component,
 * including props, events, slots, and exposed methods.
 */

import type { VariantDefinition } from './variantsConfigTypes';
import type { ImageData } from './persistedStateTypes';
import type { GeneratedCrop } from '$lib/components/backoffice/SvelteImageCrop/utils/cropGenerator';

/**
 * Layout variants for the editor
 *
 * - default: Full layout with sidebar, controls, and generated crops display
 * - compact: Compact layout with reduced sidebar
 * - two-cols: Two column layout
 * - single: Single crop layout
 * - minimal: Minimal layout without sidebar
 * - minimal-auto: Minimal layout with automatic crop activation and generation
 */
export type EditorLayout =
	| 'default'
	| 'compact'
	| 'two-cols'
	| 'single'
	| 'minimal'
	| 'minimal-auto';

/**
 * Editor configuration
 *
 * Controls UI visibility, editor behaviour, and container presentation.
 */
export type EditorConfig = {
	/** Aspect ratio (width:height) of the editor container (default: 1.5 = 3:2) */
	aspectRatio?: number;

	/** Show file upload input */
	showFileUpload?: boolean;

	/** Show zoom controls */
	showZoomControls?: boolean;

	/** Show rotate controls */
	showRotateControls?: boolean;

	/** Allow free (arbitrary angle) rotation */
	allowFreeRotate?: boolean;

	/** Show flip controls display */
	showFlipControls?: boolean;

	/** Show remove all button */
	showDisableAllVariantsButton?: boolean;

	/** Show the toggle checkbox on each variant (default: false). When false, all variants are auto-activated on mount */
	showVariantToggleButton?: boolean;

	/** Constrain crop boxes to image boundaries (default: false) */
	constrainToImage?: boolean;

	/** Allow dragging the background image (default: true) */
	imageDrag?: boolean;

	/** Show generated crops display (default: false) */
	showGeneratedCrops?: boolean;

	/** Show refresh button on generated crops (default: false) */
	showCropRefreshButton?: boolean;

	/** Show open-in-new-tab button on generated crops (default: false) */
	showCropNewTabButton?: boolean;

	/** Show download button on generated crops (default: false) */
	showCropDownloadButton?: boolean;

	/** Show delete button on generated crops, also controls delete-all (default: false) */
	showCropDeleteButtons?: boolean;

	/** Automatically disable (remove) the generated variant when a crop is deleted (default: false) */
	disableVariantOnCropDelete?: boolean;

	/** Automatically delete the generated crop when a variant is disabled/toggled off (default: false) */
	deleteCropOnVariantDisable?: boolean;
};

/**
 * Output configuration for generated crops
 *
 * Controls the format and content of generated crop outputs
 */
export type OutputConfig = {
	/** Include Base64 data URL in generated crops (default: false) */
	includeBase64?: boolean;

	/** Image format for generated crops */
	imageFormat?: 'image/jpeg' | 'image/png';

	/** Quality for JPEG format (0-1, default: 0.9) */
	quality?: number;
};

/**
 * Events emitted by SicImageEditor component
 *
 * These events allow parent components to react to user actions
 * and get results from the editor.
 */
export type SicImageEditorEvents = {
	/**
	 * Emitted when crops are generated
	 *
	 * Contains the generated crops and the image data ready to send to server
	 */
	cropsGenerated: {
		crops: GeneratedCrop[];
		imageData: ImageData;
		timestamp: number;
	};

	/**
	 * Emitted when the editor state changes
	 *
	 * This fires on any state change (crop added, removed, moved, etc.)
	 * Useful for auto-saving or real-time sync
	 */
	stateChange: {
		imageData: ImageData;
	};

	/**
	 * Emitted when a single crop is regenerated
	 */
	cropRegenerated: {
		crop: GeneratedCrop;
		cropId: string;
	};

	/**
	 * Emitted when a new image is uploaded
	 */
	imageUploaded: {
		imageSrc: string;
		file?: File;
	};

	/**
	 * Emitted when the editor is ready (after mount)
	 */
	ready: {
		instanceId: string;
		outputConfig: OutputConfig;
		editorConfig: EditorConfig;
	};

	/**
	 * Emitted when an error occurs
	 */
	error: {
		message: string;
		error?: Error;
	};
};

/** Runtime state of a crop box in the editor UI (not persisted) */
export type ActiveCropBox = {
	instanceId: string;
	crop: {
		id: string;
		preset: string;
		format: string;
		width: number;
		height: number;
	};
	x: number;
	y: number;
	width: number;
	height: number;
	zIndex: number;
};

/**
 * Public methods exposed by SicImageEditor component
 *
 * Access these methods via `bind:this`:
 *
 * @example
 * ```svelte
 * <script>
 *   let editor: SicImageEditorInstance;
 *
 *   async function save() {
 *     const crops = await editor.generateCrops();
 *     const state = editor.getState();
 *     await saveToServer(state);
 *   }
 * </script>
 *
 * <SicImageEditor bind:this={editor} ... />
 * <button onclick={save}>Save</button>
 * ```
 */
export type SicImageEditorInstance = {
	/**
	 * Generates all crops and returns the results
	 *
	 * This also triggers the 'cropsGenerated' event
	 *
	 * @returns Promise that resolves to array of generated crops
	 */
	generateCrops(): Promise<GeneratedCrop[]>;

	/**
	 * Gets the current editor state in persisted format
	 *
	 * This returns the state ready to be saved to a database
	 *
	 * @returns Current persisted state
	 */
	getState(): ImageData;

	/**
	 * Loads a saved state into the editor
	 *
	 * This restores all crops and transformations from a saved state
	 *
	 * @param state - Persisted state to load
	 */
	loadState(state: ImageData): void;

	/**
	 * Resets the editor to initial state
	 *
	 * Removes all crops, resets transformations, but keeps the current image
	 */
	reset(): void;

	/**
	 * Gets the array of generated crops
	 *
	 * @returns Array of generated crops
	 */
	getGeneratedCrops(): GeneratedCrop[];

	/**
	 * Programmatically adds a crop to the editor
	 *
	 * @param crop - Crop definition to add
	 */
	addCropBox(crop: VariantDefinition): void;

	/**
	 * Programmatically removes a crop box from the editor
	 *
	 * @param instanceId - Instance ID of the crop box to remove
	 */
	removeCropBox(instanceId: string): void;

	/**
	 * Gets the current instance ID of the editor
	 *
	 * @returns Unique instance ID
	 */
	getInstanceId(): string;

	/**
	 * Updates internal image metadata without resetting editor state.
	 *
	 * Use after a presigned S3 upload to replace the local data URL with the
	 * real S3 key/URL and assign the server-generated UUID.
	 * After calling this, `getState()` and `stateChange` events will emit the
	 * updated values.
	 *
	 * @param data - Partial image metadata to update
	 */
	setImageData(data: Partial<Pick<ImageData, 'id' | 'originalUrl' | 'originalSizeBytes'>>): void;
};
