// Llamadas HTTP: presigned URL, subida a S3 y creación/actualización de registros media

import type { ImageData } from '../types/persistedStateTypes';

export type PresignedUrlRequest = {
	fileName: string;
	mimeType: string;
	fileSize: number;
};

export type PresignedUrlResponse = {
	uploadUrl: string;
	s3Key: string;
	expiresAt: string;
	id: string;
};

export type CreateMediaPayload = ImageData & { kind: 'IMAGE' };

export type CreatedMediaResponse = { id: string; [key: string]: unknown };

export async function getUploadUrl(
	apiBaseUrl: string,
	req: PresignedUrlRequest
): Promise<PresignedUrlResponse> {
	const res = await fetch(`${apiBaseUrl}/media/upload-url`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(req)
	});
	if (!res.ok) {
		throw new Error(`Failed to get upload URL: ${res.status} ${res.statusText}`);
	}
	return res.json() as Promise<PresignedUrlResponse>;
}

export async function uploadFileToS3(uploadUrl: string, file: File): Promise<void> {
	const res = await fetch(uploadUrl, {
		method: 'PUT',
		headers: { 'Content-Type': file.type },
		body: file
	});
	if (!res.ok) {
		throw new Error(`S3 upload failed: ${res.status} ${res.statusText}`);
	}
}

export async function createMedia(
	apiBaseUrl: string,
	payload: CreateMediaPayload
): Promise<CreatedMediaResponse> {
	const res = await fetch(`${apiBaseUrl}/media`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});
	if (!res.ok) {
		throw new Error(`Failed to create media record: ${res.status} ${res.statusText}`);
	}
	return res.json() as Promise<CreatedMediaResponse>;
}

export async function updateMedia(
	apiBaseUrl: string,
	id: string,
	payload: CreateMediaPayload
): Promise<CreatedMediaResponse> {
	const res = await fetch(`${apiBaseUrl}/media/${id}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});
	if (!res.ok) {
		throw new Error(`Failed to update media record: ${res.status} ${res.statusText}`);
	}
	return res.json() as Promise<CreatedMediaResponse>;
}
