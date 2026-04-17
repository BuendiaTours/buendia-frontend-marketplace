# Integración Frontend: Publish / Unpublish de Actividades

## Contexto

El backend ha reemplazado el cambio de `status` desde el endpoint `PATCH /activities/:id` por dos endpoints dedicados:

- `POST /activities/:id/publish`
- `POST /activities/:id/unpublish`

El publish valida precondiciones y devuelve excepciones específicas con `errorCode` que el frontend debe mostrar al usuario.

## Archivos ya sincronizados (core layer)

Estos cambios ya están hechos:

- `src/core/activities/types.ts` — Eliminado `status` de `ActivityUpdateDto`
- `src/core/activities/requests.ts` — Añadidos `publish(fetchFn, id)` y `unpublish(fetchFn, id)`

## Cambios pendientes

### 1. `src/routes/(backoffice)/backoffice/activities/[id]/edit/+page.server.ts`

**Action `changeStatus`** (línea ~106-141): Reemplazar la lógica actual que usa `ACTIVITY_REQUEST.update(fetch, id, { status })` por los nuevos endpoints.

```typescript
changeStatus: async ({ fetch, params, request, cookies }) => {
	const formData = await request.formData();
	const action = formData.get('action') as string; // 'publish' | 'unpublish'

	try {
		if (action === 'publish') {
			await ACTIVITY_REQUEST.publish(fetch, params.id);
			setFlashMessage(cookies, {
				type: 'success',
				message: 'Actividad publicada correctamente.',
				code: 'status.success'
			});
		} else {
			await ACTIVITY_REQUEST.unpublish(fetch, params.id);
			setFlashMessage(cookies, {
				type: 'success',
				message: 'Actividad despublicada correctamente.',
				code: 'status.success'
			});
		}

		await new Promise((resolve) => setTimeout(resolve, 500));
		throw redirect(303, `${BACKOFFICE_PREFIX}/activities/${params.id}/edit`);
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err && err.status === 303) throw err;

		let errorMessage = 'Error al cambiar el estado de la actividad.';

		if (
			err instanceof ApiError &&
			err.data &&
			typeof err.data === 'object' &&
			'errorCode' in err.data
		) {
			const code = (err.data as { errorCode: string }).errorCode;
			errorMessage = PUBLISH_ERROR_MESSAGES[code] ?? errorMessage;
		}

		setFlashMessage(cookies, { type: 'error', message: errorMessage, code: 'status.error' });
		throw redirect(303, `${BACKOFFICE_PREFIX}/activities/${params.id}/edit`);
	}
};
```

**Mapa de errores** (declarar antes del `export const actions`):

```typescript
const PUBLISH_ERROR_MESSAGES: Record<string, string> = {
	ACTIVITY_NOT_PUBLISHABLE: 'La actividad no se puede publicar desde su estado actual.',
	ACTIVITY_MISSING_DESTINATION: 'La actividad necesita al menos una ubicación de tipo destino.',
	ACTIVITY_MISSING_PUBLISHED_OPTION: 'La actividad necesita al menos una opción publicada.',
	ACTIVITY_MISSING_CATEGORY: 'La actividad necesita al menos una categoría asignada.',
	ACTIVITY_MISSING_MEDIA: 'La actividad necesita al menos una imagen.',
	ACTIVITY_NOT_UNPUBLISHABLE: 'La actividad no se puede despublicar desde su estado actual.'
};
```

**Imports**: Ya no se necesita `ActivityStatus` en este archivo (se usaba para validar el status permitido). Se puede eliminar el import si no se usa en otro lugar del archivo.

### 2. `src/routes/(backoffice)/backoffice/activities/components/ActivityFormActions.svelte`

**Cambio 1**: Actualizar `canPublish` para incluir `APPROVED` (el backend ahora permite publicar desde DRAFT, UNPUBLISHED y APPROVED):

```diff
  const canPublish = $derived(
-   activityStatus === ActivityStatus.DRAFT || activityStatus === ActivityStatus.UNPUBLISHED
+   activityStatus === ActivityStatus.DRAFT ||
+   activityStatus === ActivityStatus.UNPUBLISHED ||
+   activityStatus === ActivityStatus.APPROVED
  );
```

**Cambio 2**: Reemplazar el `<input type="hidden" name="status" ...>` por un campo `action`:

```diff
  <form method="POST" action="?/changeStatus" use:enhance>
-   <input type="hidden" name="status" value={nextStatus} />
    {#if canPublish}
+     <input type="hidden" name="action" value="publish" />
      <button ...>
        {m.activities_publishButton()}
      </button>
    {:else}
+     <input type="hidden" name="action" value="unpublish" />
      <button ...>
        {m.activities_unpublishButton()}
      </button>
    {/if}
  </form>
```

**Cambio 3**: Eliminar la variable `nextStatus` (ya no se necesita):

```diff
- const nextStatus = $derived(canPublish ? ActivityStatus.PUBLISHED : ActivityStatus.UNPUBLISHED);
```

## Error codes del backend

| errorCode                           | Significado                                                           | Mensaje sugerido                                              |
| ----------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------- |
| `ACTIVITY_NOT_PUBLISHABLE`          | Status actual no permite publicar (solo DRAFT, UNPUBLISHED, APPROVED) | La actividad no se puede publicar desde su estado actual.     |
| `ACTIVITY_MISSING_DESTINATION`      | Sin location con rol DESTINATION                                      | La actividad necesita al menos una ubicación de tipo destino. |
| `ACTIVITY_MISSING_PUBLISHED_OPTION` | Sin opciones con status PUBLISHED                                     | La actividad necesita al menos una opción publicada.          |
| `ACTIVITY_MISSING_CATEGORY`         | Sin categorías asignadas                                              | La actividad necesita al menos una categoría asignada.        |
| `ACTIVITY_MISSING_MEDIA`            | Sin media asignado                                                    | La actividad necesita al menos una imagen.                    |
| `ACTIVITY_NOT_UNPUBLISHABLE`        | Status actual no es PUBLISHED                                         | La actividad no se puede despublicar desde su estado actual.  |

## Notas

- El `errorCode` viene en `err.data.errorCode` dentro del `ApiError`.
- Los errores son 400 (Bad Request), no 500.
- El backend devuelve también `err.data.details` con info adicional (ej: `{ activityId, currentStatus }`) por si se quiere dar más contexto.
