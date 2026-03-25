// Gestiona la subida de una nueva imagen a S3 en background y la creación del registro media

import {
	getUploadUrl,
	uploadFileToS3,
	createMedia,
	type PresignedUrlResponse,
	type CreateMediaPayload
} from './uploadService';
import type { SicImageEditorInstance } from '../types/imageEditorTypes';

type BgUpload = 'idle' | 'in-progress' | 'done' | 'error';
type SaveStep = 'idle' | 'generating' | 'creating-record' | 'done' | 'error';

export type S3UploadConfig = {
	apiBaseUrl: string;
	onSaved?: (id: string) => void;
	onError?: (msg: string) => void;
};

export function createS3UploadManager(
	config: S3UploadConfig,
	getEditor: () => SicImageEditorInstance | undefined
) {
	let bgUpload = $state<BgUpload>('idle');
	let bgUploadError = $state<string | null>(null);
	let presignedResponse = $state<PresignedUrlResponse | null>(null);
	let bgUploadPromise: Promise<void> | null = null;
	let uploadVersion = 0;

	let saveStep = $state<SaveStep>('idle');
	let saveError = $state<string | null>(null);
	let createdMediaId = $state<string | null>(null);
	let pendingFile = $state<File | null>(null);

	const canSave = $derived(
		!!pendingFile &&
			(bgUpload === 'done' || bgUpload === 'in-progress') &&
			(saveStep === 'idle' || saveStep === 'error')
	);
	const isSaving = $derived(saveStep === 'generating' || saveStep === 'creating-record');

	function handleImageUploaded(detail: { imageSrc: string; file?: File }) {
		pendingFile = detail.file ?? null;
		saveStep = 'idle';
		saveError = null;
		createdMediaId = null;

		if (pendingFile) {
			startBackgroundUpload(pendingFile);
		}
	}

	function startBackgroundUpload(file: File): void {
		const version = ++uploadVersion;
		bgUpload = 'in-progress';
		bgUploadError = null;
		presignedResponse = null;

		bgUploadPromise = (async () => {
			const presigned = await getUploadUrl(config.apiBaseUrl, {
				fileName: file.name,
				mimeType: file.type,
				fileSize: file.size
			});
			await uploadFileToS3(presigned.uploadUrl, file);
			if (version !== uploadVersion) return;
			presignedResponse = presigned;
			getEditor()?.setImageData({ id: presigned.id, originalUrl: presigned.s3Key });
			bgUpload = 'done';
		})();

		bgUploadPromise.catch((e: unknown) => {
			if (version !== uploadVersion) return;
			bgUploadError = e instanceof Error ? e.message : String(e);
			bgUpload = 'error';
		});
	}

	async function handleSave() {
		const editor = getEditor();
		if (!editor || !pendingFile) return;

		saveError = null;
		saveStep = 'generating';
		await editor.generateCrops();
		const state = editor.getState();

		if (bgUploadPromise) {
			await bgUploadPromise.catch(() => {});
		}

		if (bgUpload !== 'done' || !presignedResponse) {
			saveError = bgUploadError ?? 'Error en la subida a S3. Reintenta.';
			saveStep = 'error';
			return;
		}

		try {
			saveStep = 'creating-record';
			const payload: CreateMediaPayload = {
				...state,
				kind: 'IMAGE',
				originalSizeBytes: pendingFile.size
			};
			const response = await createMedia(config.apiBaseUrl, payload);
			createdMediaId = response.id;
			saveStep = 'done';
			config.onSaved?.(response.id);
		} catch (e) {
			saveError = e instanceof Error ? e.message : String(e);
			saveStep = 'error';
			config.onError?.(saveError);
		}
	}

	function retryUpload() {
		if (pendingFile) startBackgroundUpload(pendingFile);
	}

	function reset() {
		pendingFile = null;
		bgUpload = 'idle';
		bgUploadError = null;
		presignedResponse = null;
		bgUploadPromise = null;
		uploadVersion = 0;
		saveStep = 'idle';
		saveError = null;
		createdMediaId = null;
		getEditor()?.reset();
	}

	return {
		get bgUpload() {
			return bgUpload;
		},
		get bgUploadError() {
			return bgUploadError;
		},
		get saveStep() {
			return saveStep;
		},
		get saveError() {
			return saveError;
		},
		get createdMediaId() {
			return createdMediaId;
		},
		get pendingFile() {
			return pendingFile;
		},
		get canSave() {
			return canSave;
		},
		get isSaving() {
			return isSaving;
		},
		handleImageUploaded,
		handleSave,
		retryUpload,
		reset
	};
}
