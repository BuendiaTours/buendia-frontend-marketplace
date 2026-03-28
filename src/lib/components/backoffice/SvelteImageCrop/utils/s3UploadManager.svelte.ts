/**
 * Manages the full upload flow: presigned URL → S3 upload → create media record.
 * After record creation, the user adjusts crops and saves focal points via the edit manager.
 */

import {
	getUploadUrl,
	uploadFileToS3,
	createMedia,
	type PresignedUrlResponse,
	type CreateMediaPayload
} from './uploadService';
import type { SicImageEditorInstance } from '../types/imageEditorTypes';

type BgUpload = 'idle' | 'in-progress' | 'done' | 'error';

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
	let _presignedResponse = $state<PresignedUrlResponse | null>(null);
	let createdMediaId = $state<string | null>(null);
	let pendingFile = $state<File | null>(null);
	let uploadVersion = 0;

	function handleImageUploaded(detail: { imageSrc: string; file?: File }) {
		pendingFile = detail.file ?? null;
		bgUploadError = null;
		createdMediaId = null;

		if (pendingFile) {
			startBackgroundUpload(pendingFile);
		}
	}

	/** Upload to S3 and immediately create the media record. */
	function startBackgroundUpload(file: File): void {
		const version = ++uploadVersion;
		bgUpload = 'in-progress';
		bgUploadError = null;
		_presignedResponse = null;

		(async () => {
			const presigned = await getUploadUrl(config.apiBaseUrl, {
				fileName: file.name,
				mimeType: file.type,
				fileSize: file.size
			});

			await uploadFileToS3(presigned.uploadUrl, file);
			if (version !== uploadVersion) return;

			_presignedResponse = presigned;
			getEditor()?.setImageData({
				id: presigned.id,
				originalUrl: presigned.s3Key,
				originalSizeBytes: file.size
			});

			const editor = getEditor();
			const imgData = editor
				? (() => {
						try {
							return editor.getState();
						} catch {
							return null;
						}
					})()
				: null;

			const payload: CreateMediaPayload = {
				id: presigned.id,
				altText: imgData?.altText ?? '',
				kind: 'IMAGE',
				mimeType: file.type,
				originalHeight: imgData?.originalHeight ?? 0,
				originalSizeBytes: file.size,
				originalUrl: presigned.s3Key,
				originalWidth: imgData?.originalWidth ?? 0,
				title: imgData?.title ?? ''
			};

			await createMedia(config.apiBaseUrl, payload);
			if (version !== uploadVersion) return;

			createdMediaId = presigned.id;
			bgUpload = 'done';
			config.onSaved?.(presigned.id);
		})().catch((e: unknown) => {
			if (version !== uploadVersion) return;
			bgUploadError = e instanceof Error ? e.message : String(e);
			bgUpload = 'error';
			config.onError?.(bgUploadError);
		});
	}

	function retryUpload() {
		if (pendingFile) startBackgroundUpload(pendingFile);
	}

	function reset() {
		pendingFile = null;
		bgUpload = 'idle';
		bgUploadError = null;
		_presignedResponse = null;
		createdMediaId = null;
		uploadVersion = 0;
		getEditor()?.reset();
	}

	return {
		get bgUpload() {
			return bgUpload;
		},
		get bgUploadError() {
			return bgUploadError;
		},
		get createdMediaId() {
			return createdMediaId;
		},
		get pendingFile() {
			return pendingFile;
		},
		handleImageUploaded,
		retryUpload,
		reset
	};
}
