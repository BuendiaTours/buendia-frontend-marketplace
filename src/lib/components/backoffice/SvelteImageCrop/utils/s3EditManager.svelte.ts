import { updateMedia, type CreateMediaPayload } from './uploadService';
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
		await editor.generateCrops();
		const state = editor.getState();

		try {
			saveStep = 'saving';
			const payload: CreateMediaPayload = { ...state, kind: 'IMAGE' };
			const response = await updateMedia(config.apiBaseUrl, mediaId, payload);
			updatedMediaId = response.id;
			saveStep = 'done';
			config.onSaved?.(response.id);
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
