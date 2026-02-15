# Buenas practicas del Core

Como se comunican la API del backend, la capa core y las vistas de SvelteKit en este proyecto.

---

## Vista general de la arquitectura

```
API REST del Backend
       |
       v
  src/core/           ← Capa de dominio pura (tipos, enums, requests)
       |
       v
  +page.server.ts     ← Carga de datos y acciones de formulario (SvelteKit)
       |
       v
  +page.svelte        ← Vista (Svelte 5 runes, filtros basados en URL)
       |
       v
  $lib/labels/        ← Mapeo de enums a traducciones i18n
```

Cada capa tiene una responsabilidad unica y solo depende de la capa superior.

---

## 1. Capa Core (`src/core/`)

El core es el **unico lugar que habla con el backend**. No tiene dependencias de UI ni imports de SvelteKit (salvo la firma de tipo de `fetch`).

### Estructura por recurso

```
src/core/activities/
  enums.ts       ← Espejo de los enums del backend (ActivityStatus, ActivityKind…)
  types.ts       ← Projections (lectura), DTOs (escritura), Criteria (consulta)
  requests.ts    ← Namespace de metodos API (ACTIVITY_REQUEST)
```

### Reglas

- **Nunca importar desde `$lib/`, `$app/` ni ningun fichero Svelte** dentro de `src/core/`.
- **Un namespace por recurso**: `ACTIVITY_REQUEST`, `USER_REQUEST`, etc.
- **Todos los metodos reciben `fetchFn: typeof fetch` como primer argumento** para preservar el reenvio de cookies en SSR.
- **Los enums replican el backend exactamente** — sin formato, sin traducciones, sin logica de presentacion.
- **Los tipos se dividen en tres categorias**:
  - `Projection` — lo que devuelve la API (modelo de lectura)
  - `Dto` — lo que enviamos a la API (modelo de escritura)
  - `Criteria` — parametros de consulta para filtrado/paginacion

### Ejemplo

```typescript
// src/core/activities/requests.ts
export const ACTIVITY_REQUEST = {
	findByCriteria: (fetchFn: typeof fetch, criteria?: ActivityCriteria) =>
		getWithParams<CriteriaResult<Activity>>(fetchFn, BASE, criteria),

	create: (fetchFn: typeof fetch, data: ActivityCreateDto) => post(fetchFn, BASE, data),

	update: (fetchFn: typeof fetch, id: string, data: ActivityUpdateDto) =>
		patch(fetchFn, `${BASE}/${id}`, data)
};
```

### Anadir un nuevo recurso

1. Crear `src/core/{recurso}/enums.ts` — enums del dominio
2. Crear `src/core/{recurso}/types.ts` — Projection, DTOs, Criteria
3. Crear `src/core/{recurso}/requests.ts` — namespace `{RECURSO}_REQUEST`
4. Todo el HTTP pasa por `$core/_shared/helpers.ts` (`get`, `getWithParams`, `post`, `patch`, `del`)

---

## 2. Capa Servidor (`+page.server.ts`)

Los ficheros del servidor consumen la capa core y exponen datos a las vistas mediante `load` y `actions` de SvelteKit.

### Funciones de carga

```typescript
// +page.server.ts (pagina de listado)
import { ACTIVITY_REQUEST } from '$core/activities/requests';
import { parseFilters } from '$lib/utils/filters';
import { buildPagination } from '$core/_shared/params';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const filters = parseFilters(activitiesFiltersSchema, url.searchParams);

	const response = await ACTIVITY_REQUEST.findByCriteria(fetch, {
		page: filters.page,
		pageSize: filters.pageSize,
		status: filters.status,
		sort: filters.sort,
		order: filters.order
	});

	return {
		items: response.data,
		pagination: buildPagination(response.total, filters.page, filters.pageSize),
		filters
	};
};
```

### Reglas

- **Siempre pasar el `fetch` de SvelteKit** (del evento) a los metodos del core — nunca usar un `fetch` global.
- **Parsear los parametros de la URL con `parseFilters()`** — la URL es la unica fuente de verdad del estado de un listado.
- **Devolver objetos tipados** — las vistas reciben tipos fuertes via `$props()`.
- **Gestionar errores con `handleApiError()`** de `$core/_shared/errors.ts`:

```typescript
try {
	const activity = await ACTIVITY_REQUEST.findBySlug(fetch, slug);
	return { activity };
} catch (err) {
	throw handleApiError(err, 'la actividad');
}
```

### Acciones de formulario (crear / actualizar / eliminar)

Usar las factorias del servidor para evitar codigo repetitivo:

```typescript
// +page.server.ts (pagina de creacion)
import { createCreateAction } from '$lib/server/backoffice/createAction';

export const actions: Actions = {
	default: createCreateAction({
		schema: zod(activityFormSchema),
		createFn: ACTIVITY_REQUEST.create,
		basePath: `${BACKOFFICE_PREFIX}/activities`,
		entityName: 'actividad',
		redirectToEdit: true
	})
};
```

La factoria se encarga de: validacion con Superforms, llamada a la API, mensaje flash, redireccion y mapeo de errores.

Factorias disponibles:
| Factoria | Fichero | Proposito |
|---|---|---|
| `createCreateAction` | `$lib/server/backoffice/createAction.ts` | Creacion con redireccion |
| `createUpdateAction` | `$lib/server/backoffice/updateAction.ts` | Actualizacion parcial (PATCH) |
| `createDeleteAction` | `$lib/server/backoffice/deleteAction.ts` | Eliminacion con redireccion |

---

## 3. Capa Vista (`+page.svelte`)

Las vistas reciben datos del server load, renderizan la UI y usan mutaciones de URL para los cambios de estado.

### Recibir datos

```svelte
<script lang="ts">
	let { data } = $props();

	const items = $derived(data.items);
	const pagination = $derived(data.pagination);
</script>
```

- Usar siempre **runes de Svelte 5** (`$props`, `$derived`, `$state`).
- Nunca usar `export let` ni `$:`.

### Filtros basados en URL

La URL es la unica fuente de verdad para filtros, paginacion y ordenacion. Los cambios de filtro en el cliente actualizan la URL, lo que dispara una recarga del servidor.

```svelte
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { patchFilters } from '$lib/utils/filters';
	import { activitiesFiltersSchema } from './schemas/filters.schema';

	function applyFilter(patch: Partial<ActivitiesFilters>) {
		const newParams = patchFilters(activitiesFiltersSchema, page.url.searchParams, patch);
		goto(`?${newParams}`, { replaceState: true, noScroll: true, keepFocus: true });
	}
</script>

<!-- Uso -->
<FilterSelect value={data.filters.status} onchange={(v) => applyFilter({ status: v })} />
```

### Definicion del schema de filtros

Cada pagina de listado define un schema de filtros en `schemas/filters.schema.ts`:

```typescript
export const activitiesFiltersSchema: FiltersSchema<ActivitiesFilters> = {
	fields: {
		page: createPageField(),
		pageSize: createPageSizeField(),
		sort: createSortField(['codeRef', 'title']),
		order: createOrderField(),
		status: {
			parse: (raw) => raw || undefined,
			serialize: (value, out) => {
				if (value) out.set('status', value);
				else out.delete('status');
			},
			resetPageOnChange: true
		}
	}
};
```

Helpers clave de `$lib/utils/filters.ts`:
| Helper | Proposito |
|---|---|
| `createPageField()` | Numero de pagina (por defecto 1) |
| `createPageSizeField()` | Elementos por pagina (por defecto 10) |
| `createSortField(allowed)` | Valida contra campos de ordenacion permitidos |
| `createOrderField()` | ASC/DESC |
| `createBooleanField(key)` | Presencia en URL = true |

### Flujo de filtros

No recarga la pagina completa. SvelteKit hace una **navegacion del lado del cliente**:
solo re-ejecuta el `load()` del servidor y actualiza los fragmentos del DOM que cambiaron.
El layout, header, sidebar y filtros que no cambiaron no se tocan.

```
El usuario hace clic en un filtro → applyFilter({ status: 'DRAFT' })
  → patchFilters() construye nuevos URLSearchParams
  → goto('?status=DRAFT&page=1') (la pagina se resetea si resetPageOnChange)
  → SvelteKit hace un fetch interno al load() de +page.server.ts (sin recargar el navegador)
  → parseFilters() lee los parametros de la URL
  → *_REQUEST.findByCriteria() llama al backend
  → Svelte actualiza solo las partes del DOM que cambiaron (tabla, contadores, filtro activo…)
```

---

## 4. Labels (`$lib/labels/`)

Los labels conectan los enums del dominio (core) con las traducciones i18n (Paraglide) para su presentacion en la UI.

### Patron

```typescript
// $lib/labels/activities.ts
import { ActivityStatus } from '$core/activities/enums';
import * as m from '$paraglide/messages';

export const ACTIVITY_STATUS_OPTIONS = [
	{ id: ActivityStatus.APPROVED, name: m.enum_activityStatus_approved() },
	{ id: ActivityStatus.DRAFT, name: m.enum_activityStatus_draft() },
	{ id: ActivityStatus.PUBLISHED, name: m.enum_activityStatus_published() }
];
```

### Reglas

- **Los labels viven en `$lib/labels/`, nunca en `$core/`** — el core no tiene dependencia de i18n.
- **Convencion de clave de mensaje**: `enum_{recurso}{NombreEnum}_{valorEnCamelCase}`.
- **Cada fichero exporta arrays `*_OPTIONS`** con estructura `{ id, name }`.
- **Las traducciones viven en `messages/{locale}/enums.json`**.

### Uso en componentes

```svelte
<script lang="ts">
	import { ACTIVITY_STATUS_OPTIONS } from '$lib/labels/activities';
</script>

<!-- Desplegable -->
{#each ACTIVITY_STATUS_OPTIONS as opt}
	<option value={opt.id}>{opt.name}</option>
{/each}

<!-- Celda de tabla -->
{ACTIVITY_STATUS_OPTIONS.find((o) => o.id === item.status)?.name}
```

---

## 5. Flujo de datos completo

### Lectura (pagina de listado)

```
URL (?page=2&status=DRAFT)
  → +page.server.ts: parseFilters() → ACTIVITY_REQUEST.findByCriteria(fetch, criteria)
    → helpers de $core: toSkipLimit() convierte page/pageSize → skip/limit
      → apiClient.request(): timeout, reintentos, cabeceras de auth, mapeo de errores
        → API del backend: GET /activities?skip=10&limit=10&status=DRAFT
  → return { items, pagination, filters }
  → +page.svelte: $props() → $derived() → renderiza tabla + filtros
```

### Escritura (crear/actualizar)

```
El usuario rellena el formulario → envia
  → accion de +page.server.ts: validacion Superforms + Zod
    → ACTIVITY_REQUEST.create(fetch, dto)
      → apiClient.request(): POST /activities { body }
        → API del backend
  → Mensaje flash → redireccion al listado/edicion
```

### Eliminacion

```
El usuario confirma la eliminacion
  → accion de +page.server.ts: createDeleteAction()
    → ACTIVITY_REQUEST.delete(fetch, id)
      → apiClient.request(): DELETE /activities/{id}
  → Mensaje flash → redireccion al listado
```

---

## 6. Gestion de errores

Los errores fluyen hacia arriba a traves de instancias tipadas de `ApiError`:

| Capa                   | Responsabilidad                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------- |
| `apiClient.request()`  | Mapea codigo HTTP → tipo `ApiError` (`not_found`, `timeout`, `validation`…)         |
| `handleApiError()`     | Convierte `ApiError` → `HttpError` de SvelteKit con mensaje para el usuario         |
| Factorias del servidor | Capturan errores, devuelven `fail()` con mensajes flash para acciones de formulario |
| `+error.svelte`        | Renderiza paginas de error de SvelteKit para errores no capturados                  |

---

## 7. Checklist para anadir un nuevo recurso

1. **Core**: `src/core/{recurso}/enums.ts`, `types.ts`, `requests.ts`
2. **Labels**: `src/lib/labels/{recurso}.ts` — mapeo de enums para presentacion
3. **Traducciones**: anadir claves en `messages/{locale}/enums.json` (y registrar el fichero en el pathPattern de `settings.json` si es nuevo)
4. **Rutas**: `src/lib/config/routes/backoffice/{recurso}.ts` — helpers de URL
5. **Schema de filtros**: `src/routes/(backoffice)/backoffice/{recurso}/schemas/filters.schema.ts`
6. **Schema de formulario**: `src/routes/(backoffice)/backoffice/{recurso}/schemas/{recurso}-form.schema.ts` (Zod)
7. **Servidor**: `+page.server.ts` — load con `parseFilters` + `*_REQUEST`, acciones con factorias
8. **Vista**: `+page.svelte` — `$props()`, `$derived()`, `patchFilters()` para actualizar filtros en el cliente
