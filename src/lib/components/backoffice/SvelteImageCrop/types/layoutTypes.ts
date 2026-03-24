import type { ActiveCropBox, EditorConfig } from './imageEditorTypes';
import type { VariantDefinition } from './variantsConfigTypes';
import type { GeneratedCrop } from '../utils/cropGenerator';

export type EditorContainerApi = {
	getCropResolutionInfo(): { scaleX: number; scaleY: number } | null;
	getImageData(): {
		element: HTMLImageElement;
		containerWidth: number;
		containerHeight: number;
		displayWidth: number;
		displayHeight: number;
	} | null;
	waitForImageReady(): Promise<void>;
	waitForImageLoad(): Promise<void>;
	getTransformState(): {
		rotation: number;
		zoom: number;
		flipH: boolean;
		flipV: boolean;
		imageX: number;
		imageY: number;
	};
	getImageBounds(): { width: number; height: number } | null;
	applyTransform(modifications: unknown): void;
	reset(): void;
};

/**
 * Props shared by all layout components
 *
 * This interface defines the contract that all layout components must implement.
 * It includes configuration props, state props, and callback props.
 */
export type LayoutProps = {
	// ===== Configuration Props =====
	/** CSS class for the wrapper element */
	wrapperClass?: string;
	/** CSS class for the column element */
	columnClass?: string;
	/** Name attribute for the file input (for HTML form submissions) */
	fileInputName?: string;
	/** Reference to the editor container component (bindable) */
	editorContainerComponent?: EditorContainerApi;
	/** Title of the image (bindable) */
	title?: string;
	/** Alt text for the image (bindable) */
	altText?: string;

	// ===== State Props =====
	/** Source URL of the image */
	imageSrc: string;
	/** X position of the image */
	imageX: number;
	/** Y position of the image */
	imageY: number;
	/** Array of active crop boxes */
	activeCropBoxes: ActiveCropBox[];
	/** ID of the selected crop box */
	selectedCropBoxId: string | null;
	/** Array of normalized crop definitions */
	normalizedCrops: VariantDefinition[];
	/** Array of generated crops */
	generatedCrops: GeneratedCrop[];
	/** ID of the crop being manipulated */
	manipulatingCropId: string | null;
	/** Whether any active crop box has lower resolution than its output dimensions */
	hasLowResolutionCrops: boolean;
	/** Set of crop definition IDs that have insufficient resolution */
	lowResolutionCropIds: Set<string>;
	/** Editor configuration */
	editorConfig: EditorConfig;

	// ===== Callback Props =====
	/** Called when a file is uploaded */
	onFileUpload: (event: Event) => void;
	/** Called when the image position changes */
	onPositionChange: (event: CustomEvent) => void;
	/** Called when a crop box is updated */
	onCropBoxUpdate: (event: CustomEvent) => void;
	/** Called when a crop box is removed */
	onCropBoxRemove: (event: CustomEvent) => void;
	/** Called when a crop box is selected */
	onCropBoxSelect: (event: CustomEvent) => void;
	/** Called when a crop box drag ends */
	onCropBoxDragEnd: () => void;
	/** Called when a crop box is double-clicked to reset its position/size */
	onCropBoxReset: (event: CustomEvent) => void;
	/** Called when a crop variant is toggled */
	onToggleCropBox: (crop: VariantDefinition) => void;
	/** Called when a crop box is selected by ID */
	onSelectCropBox: (instanceId: string) => void;
	/** Called to remove all crop boxes */
	onRemoveAllCropBoxes: () => void;
	/** Called to generate crops */
	onGenerateCrops: () => void;
	/** Called to delete all generated crops */
	onDeleteAllGeneratedCrops: () => void;
	/** Called to regenerate a specific crop */
	onRegenerateCrop: (cropId: string) => void;
	/** Called to delete a specific generated crop */
	onDeleteGeneratedCrop: (cropId: string) => void;
}
