# Sistema de Multimedia e Imágenes

## Visión general

El sistema de multimedia gestiona la subida de imágenes, edición de recortes (crops) y relaciones media-entidad. Usa S3 para almacenamiento, CloudFront CDN para servir las imágenes, y un backend CQRS.

## Variables de entorno

- `PUBLIC_API_BASE_URL` — Backend API (ej: `http://localhost:3000`)
- `PUBLIC_CDN_BASE_URL` — CloudFront CDN (ej: `https://d364204zyamm3v.cloudfront.net`)

## Flujo de subida a S3

1. `getUploadUrl(apiBaseUrl, { fileName, mimeType, fileSize })` → devuelve `{ uploadUrl, s3Key, expiresAt }`
2. `uploadFileToS3(presigned.uploadUrl, file)` → PUT a S3
3. Extraer UUID de la s3Key: `originals/{uuid}/filename.jpg`
4. `createMedia(apiBaseUrl, payload)` → POST `/media` (devuelve 201 sin body)

**Upload service**: `src/lib/components/backoffice/SvelteImageCrop/utils/uploadService.ts`

## Resolución de originalUrl

La API devuelve `originalUrl` como una S3 key relativa (ej: `originals/xxx/file.jpg`), no una URL completa. Hay que prefijar con el CDN:

```typescript
if (media.originalUrl && !media.originalUrl.startsWith('http')) {
	media.originalUrl = `${PUBLIC_CDN_BASE_URL}/${media.originalUrl}`;
}
```

Se hace en `multimedia/[id]/edit/+page.server.ts` para el editor de recortes, y del lado del cliente en content blocks para el lightbox.

## Presets de variantes

Presets del API: `HERO_DESKTOP` (1920×1080), `HERO_MOBILE` (768×1024), `CARD` (400×300), `THUMBNAIL` (200×200).

Configuración: `src/lib/config/image-crop-variants.ts` — debe coincidir exactamente con los presets del API (formato JPEG).

## Editor de recortes (SicImageEditor)

- Ubicado en `src/lib/components/backoffice/SvelteImageCrop/`
- Requiere `crossorigin="anonymous"` en las imágenes → CloudFront debe tener CORS configurado
- `showVariantToggleButton: true` para activación manual de crops
- Prop `savedFocalPoints` posiciona los crops en las ubicaciones guardadas al activarlos
- Nunca pasar `initialState` desde datos del API — la estructura de variants del API no coincide con `ImageData`
- Ocultar inputs de título/altText via CSS: `.sic-hide-metadata :global(.sic-input-title) { display: none; }`

## Focal Points

- Se guardan via PATCH `/media/:id` con `{ focalPoints: { PRESET: { x, y, scale } } }`
- Los valores deben estar clampeados a [0, 1]
- `x`/`y` son coordenadas normalizadas del centro, `scale` es nivel de zoom
- El edit manager (`s3EditManager`) solo envía `focalPoints`, no `title`/`altText` (esos los guarda Superforms)

## Media Relationships

Se usan para vincular media a entidades (content blocks, actividades, etc.).

```typescript
MEDIA_RELATIONSHIP_REQUEST.create(fetch, {
	id: crypto.randomUUID(),
	entityId: contentBlockId,
	mediaId: mediaId,
	entityType: MediaRelationshipEntityType.CONTENT_BLOCK
});
```

Tipos de entidad: `ACTIVITY`, `CONTENT_BLOCK`, `DISTRIBUTIVE`

## Patrón de imágenes en Content Blocks

- La sección de imágenes solo se muestra en modo edición (necesita entityId)
- Añadir/quitar imágenes es solo estado local — se sincroniza al guardar
- `syncRelationships()` compara imágenes iniciales vs actuales tras el guardado exitoso de Superforms
- 500ms de delay tras sincronizar para propagación CQRS antes del redirect
- `EntityImage` tiene `{ mediaId, order, originalUrl, variants: Record<string, string> }`
- Los thumbnails en resultados de búsqueda usan el campo `SearchResult.image`
- Click en imagen abre PhotoSwipe lightbox con `originalUrl` (resuelta con CDN)

## Página de listado de Multimedia

- Crear: dialog en la página de listado (título, altText, fichero) → sube a S3 + crea registro → redirige a editar
- Thumbnails desde el array `variants` (preset THUMBNAIL preferido, fallback al primero)
- `originalUrl` en la tabla NO es usable como src de imagen (es S3 key, no URL)

## Requisitos en AWS

- CORS del bucket S3: Permitir `PUT` desde localhost + dominio de producción
- CloudFront: Response headers policy con CORS para `GET`/`HEAD` desde localhost + producción
- Sin CORS, `crossorigin="anonymous"` en las imágenes bloquea la carga
