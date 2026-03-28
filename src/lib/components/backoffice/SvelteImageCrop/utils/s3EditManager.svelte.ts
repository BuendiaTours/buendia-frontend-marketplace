/**
 * Manages saving crop/focal-point edits on an existing media record (PATCH).
 */

import { updateMedia, type UpdateMediaPayload } from './uploadService';
import type { SicImageEditorInstance } from '../types/imageEditorTypes';
import type { S3UploadConfig } from './s3UploadManager.svelte';

type SaveStep = 'idle' | 'generating' | 'saving' | 'done' | 'error';

export function createS3EditManager(
	config: S3UploadConfig,
	getEditor: () => SicImageEditorInstance | undefined,
	mediaId: string
) {
	let saveStep = $state<SaveStep>('idle');
	let saveError = $state<string | null>(null);
	let updatedMediaId = $state<string | null>(null);

	const canSave = $derived(saveStep === 'idle' || saveStep === 'error');
	const isSaving = $derived(saveStep === 'generating' || saveStep === 'saving');

	async function handleSave() {
		const editor = getEditor();
		if (!editor) return;

		saveError = null;
		saveStep = 'generating';
		try {
			await editor.generateCrops();
		} catch (e) {
			console.error('[EDIT MANAGER] generateCrops failed:', e);
		}
		const state = editor.getState();

		try {
			saveStep = 'saving';

			const clamp = (v: number) => Math.max(0, Math.min(1, v));
			const focalPoints: Record<string, { x: number; y: number; scale: number } | null> = {};
			for (const variant of state.variants) {
				focalPoints[variant.preset] = {
					x: clamp(variant.normalizedCoords.x),
					y: clamp(variant.normalizedCoords.y),
					scale: clamp(variant.normalizedCoords.scale ?? 0.5)
				};
			}

			const payload: UpdateMediaPayload = {
				focalPoints
			};

			await updateMedia(config.apiBaseUrl, mediaId, payload);
			updatedMediaId = mediaId;
			saveStep = 'done';
			config.onSaved?.(mediaId);
		} catch (e) {
			saveError = e instanceof Error ? e.message : String(e);
			saveStep = 'error';
			config.onError?.(saveError);
		}
	}

	return {
		get saveStep() {
			return saveStep;
		},
		get saveError() {
			return saveError;
		},
		get updatedMediaId() {
			return updatedMediaId;
		},
		get canSave() {
			return canSave;
		},
		get isSaving() {
			return isSaving;
		},
		handleSave
	};
}
