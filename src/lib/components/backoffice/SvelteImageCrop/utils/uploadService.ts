// Llamadas HTTP: presigned URL, subida a S3 y creación/actualización de registros media

export type PresignedUrlRequest = {
	fileName: string;
	mimeType: string;
	fileSize: number;
};

/** Normalized response used internally by the upload manager. */
export type PresignedUrlResponse = {
	uploadUrl: string;
	s3Key: string;
	expiresAt: string;
	id: string;
};

/** Raw response from the API upload-url endpoint. */
type ApiUploadUrlResponse = {
	uploadUrl: string;
	s3Key: string;
	expiresAt: string;
};

/** Payload for creating a media record (POST /media). */
export type CreateMediaPayload = {
	id: string;
	altText: string;
	kind: string;
	mimeType: string;
	originalHeight: number;
	originalSizeBytes: number;
	originalUrl: string;
	originalWidth: number;
	title: string;
};

/** Payload for updating focal points (PATCH /media/:id). */
export type UpdateMediaPayload = {
	altText?: string;
	title?: string;
	focalPoints?: Record<string, { x: number; y: number; scale: number } | null>;
};

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
	const raw: ApiUploadUrlResponse = await res.json();
	const uuidMatch = raw.s3Key.match(
		/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
	);
	return {
		uploadUrl: raw.uploadUrl,
		s3Key: raw.s3Key,
		expiresAt: raw.expiresAt,
		id: uuidMatch?.[0] ?? ''
	};
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

/** Creates the media record. API returns 201 with no body. */
export async function createMedia(apiBaseUrl: string, payload: CreateMediaPayload): Promise<void> {
	const res = await fetch(`${apiBaseUrl}/media`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});
	if (!res.ok) {
		const errorBody = await res.text();
		throw new Error(`Failed to create media record: ${res.status} ${errorBody}`);
	}
}

/** Updates focal points on an existing media record. API returns 200 with no body. */
export async function updateMedia(
	apiBaseUrl: string,
	id: string,
	payload: UpdateMediaPayload
): Promise<void> {
	const res = await fetch(`${apiBaseUrl}/media/${id}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});
	if (!res.ok) {
		const errorBody = await res.text();
		throw new Error(`Failed to update media record: ${res.status} ${errorBody}`);
	}
}
