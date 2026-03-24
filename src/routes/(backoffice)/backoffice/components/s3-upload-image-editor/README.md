# S3 Presigned URL Upload

Flujo de subida en background: S3 sube mientras el usuario ajusta recortes. La lógica de subida vive en la capa de página — `SicImageEditor` permanece agnóstico.

## Archivos clave

| Archivo                           | Rol                              |
| --------------------------------- | -------------------------------- |
| `+page.svelte`                    | Página de demo con UI de estado  |
| `utils/s3UploadManager.svelte.ts` | Estado reactivo (Svelte 5 runes) |
| `utils/uploadService.ts`          | Llamadas HTTP a la API           |

---

## Flujo

```
Usuario sube imagen
  → on:imageUploaded → handleImageUploaded()
      → startBackgroundUpload()  ← no bloquea la UI
          1. POST /media/upload-url  → { uploadUrl, s3Key, id, expiresAt }
          2. PUT {uploadUrl}         → sube el File directo a S3
          3. editor.setImageData({ id, originalUrl: s3Key })

Usuario ajusta recortes (S3 sube en paralelo)

Usuario pulsa "Guardar"
  → handleSave()
      1. editor.generateCrops()    → calcula normalizedCoords
      2. await bgUploadPromise     → espera si S3 aún no terminó
      3. POST /media               → registra el asset con recortes
```

> **Race condition:** `uploadVersion` se incrementa con cada nueva imagen. Respuestas de subidas anteriores se descartan si `version !== uploadVersion`.

---

## API esperada

### `POST /media/upload-url`

**Request:** `{ "fileName": "foto.jpg", "mimeType": "image/jpeg", "fileSize": 102400 }`

**Response:**

```json
{
	"uploadUrl": "https://s3.amazonaws.com/...",
	"s3Key": "uploads/uuid/foto.jpg",
	"expiresAt": "...",
	"id": "media-uuid"
}
```

### `PUT {uploadUrl}`

Subida directa del `File` a S3 con `Content-Type` del archivo. Sin auth propia (URL ya presignada).

### `POST /media`

**Request:** `editor.getState()` + `kind: "IMAGE"` + `originalSizeBytes`
**Response:** `{ "id": "media-uuid", ... }`

---

## Integración en otro proyecto

```svelte
<script lang="ts">
	import { createS3UploadManager } from './utils/s3UploadManager.svelte';

	let editor = $state<SicImageEditorInstance>();

	const upload = createS3UploadManager(
		{ apiBaseUrl: 'https://tu-api.com', onSaved: (id) => console.log(id), onError: console.error },
		() => editor
	);
</script>

<SicImageEditor bind:this={editor} on:imageUploaded={upload.handleImageUploaded} />

<button disabled={!upload.canSave || upload.isSaving} onclick={upload.handleSave}> Guardar </button>
```

### Estado reactivo

| Propiedad        | Tipo                                                               | Descripción                    |
| ---------------- | ------------------------------------------------------------------ | ------------------------------ |
| `bgUpload`       | `'idle' \| 'in-progress' \| 'done' \| 'error'`                     | Estado subida S3               |
| `saveStep`       | `'idle' \| 'generating' \| 'creating-record' \| 'done' \| 'error'` | Paso del guardado              |
| `canSave`        | `boolean`                                                          | `true` cuando se puede guardar |
| `isSaving`       | `boolean`                                                          | `true` mientras guarda         |
| `createdMediaId` | `string \| null`                                                   | ID del media creado            |
| `saveError`      | `string \| null`                                                   | Error al guardar               |

### Métodos

| Método                       | Descripción                          |
| ---------------------------- | ------------------------------------ |
| `handleImageUploaded(event)` | Listener para `on:imageUploaded`     |
| `handleSave()`               | Genera recortes y registra en la API |
| `retryUpload()`              | Reintenta si S3 falló                |
| `reset()`                    | Limpia todo el estado                |
