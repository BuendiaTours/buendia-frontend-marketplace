# Guía: Crear una sección CRUD en el Backoffice

> Ejemplo de referencia: sección **Locations**
> `src/routes/(backoffice)/backoffice/locations/`

---

## Estructura de ficheros

```
backoffice/[resource]/
├── +page.svelte                  ← Listado
├── +page.server.ts               ← Load del listado (filtros + API)
├── create/
│   ├── +page.svelte              ← Formulario de creación
│   └── +page.server.ts           ← Load + action de creación
├── [id]/edit/
│   ├── +page.svelte              ← Formulario de edición
│   └── +page.server.ts           ← Load + actions de edición y borrado
├── components/
│   ├── ResourceForm.svelte       ← Formulario compartido (create + edit)
│   └── ResourceFormActions.svelte ← Barra de acciones (volver, borrar, guardar)
├── queries/
│   └── resource-search.queries.ts ← Búsquedas asíncronas del lado del cliente
└── schemas/
    ├── resource-form.schema.ts   ← Schema Zod del formulario
    └── filters.schema.ts         ← Schema de filtros URL
```

---

## 1. Tipos y peticiones API (`src/core/`)

### Tipos — `src/core/[resource]/types.ts`

```typescript
import type { ResourceKind } from '$core/[resource]/enums';

/** Full projection as returned by the API. */
export type Resource = {
	id: string;
	name: string;
	kind: ResourceKind;
	descriptionShort: string | null;
};

/** Payload for creating a new resource. */
export type ResourceCreateDto = {
	id: string;
	name: string;
	kind: ResourceKind;
	descriptionShort?: string;
};

/** Payload for partially updating a resource. */
export type ResourceUpdateDto = {
	name?: string;
	kind?: ResourceKind;
	descriptionShort?: string;
};

/** Query parameters for filtering/sorting/paginating. */
export type ResourceCriteria = {
	skip?: number;
	limit?: number;
	query?: string;
	kind?: ResourceKind;
	sort?: string;
	order?: string;
};
```

### Requests — `src/core/[resource]/requests.ts`

```typescript
import type { CriteriaResult } from '$core/_shared/types';
import { get, getWithParams, post, patch, del } from '$core/_shared/helpers';
import type { Resource, ResourceCreateDto, ResourceCriteria, ResourceUpdateDto } from './types';

const BASE = '/resources';

/** API request functions for the Resource entity. */
export const RESOURCE_REQUEST = {
	create: (fetchFn: typeof fetch, data: ResourceCreateDto): Promise<void> =>
		post(fetchFn, BASE, data),

	update: (fetchFn: typeof fetch, id: string, data: ResourceUpdateDto): Promise<void> =>
		patch(fetchFn, `${BASE}/${id}`, data),

	delete: (fetchFn: typeof fetch, id: string): Promise<void> => del(fetchFn, `${BASE}/${id}`),

	findById: (fetchFn: typeof fetch, id: string): Promise<Resource> =>
		get<Resource>(fetchFn, `${BASE}/${id}`),

	findByCriteria: (
		fetchFn: typeof fetch,
		criteria?: ResourceCriteria
	): Promise<CriteriaResult<Resource>> =>
		getWithParams<CriteriaResult<Resource>>(fetchFn, BASE, criteria)
};
```

> Nunca usar `fetch()` directamente. Siempre pasar a través de los helpers de `$core` para obtener retry, timeout, auth headers y errores tipados.

---

## 2. Schema de validación (Zod)

**Archivo:** `schemas/resource-form.schema.ts`

```typescript
import { z } from 'zod/v3';
import { ResourceKind } from '$core/[resource]/enums';

export const resourceFormSchema = z.object({
	id: z.string(),
	name: z.string().min(2).max(100),
	kind: z.nativeEnum(ResourceKind),
	descriptionShort: z.string().max(500).optional()
});

export type ResourceFormSchema = z.infer<typeof resourceFormSchema>;
```

---

## 3. Filtros URL

**Archivo:** `schemas/filters.schema.ts`
**Utilidades:** [`src/lib/utils/filters.ts`](src/lib/utils/filters.ts)

La URL es la única fuente de verdad para filtros, paginación y orden:

```typescript
import {
	createPageField,
	createPageSizeField,
	createSortField,
	createOrderField
} from '$lib/utils/filters';

export type ResourceFilters = {
	page?: number;
	pageSize?: number;
	sort?: 'name' | 'kind';
	order?: 'asc' | 'desc';
	q?: string;
	kind?: string;
};

export const resourceFiltersSchema = {
	fields: {
		page: createPageField(),
		pageSize: createPageSizeField(),
		sort: createSortField(['name', 'kind'] as const),
		order: createOrderField(),
		q: {
			parse: (raw: string | null) => raw || undefined,
			serialize: (val: string | undefined, out: URLSearchParams) => {
				if (val) out.set('q', val);
				else out.delete('q');
			},
			resetPageOnChange: true
		}
	}
};
```

---

## 4. Server: Load y Actions

### Listado — `+page.server.ts`

```typescript
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { parseFilters } from '$lib/utils/filters';
import { buildPagination } from '$core/_shared/params';
import { ApiError } from '$core/_shared/errors';
import { RESOURCE_REQUEST } from '$core/[resource]/requests';
import { resourceFiltersSchema } from './schemas/filters.schema';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const filters = parseFilters(resourceFiltersSchema, url.searchParams);

	try {
		const response = await RESOURCE_REQUEST.findByCriteria(fetch, {
			page: filters.page,
			pageSize: filters.pageSize,
			sort: filters.sort,
			order: filters.order,
			query: filters.q
		});

		return {
			items: response.data || [],
			pagination: buildPagination(response.total, filters.page ?? 1, filters.pageSize ?? 10),
			filters,
			sort: filters.sort && filters.order ? { field: filters.sort, order: filters.order } : null
		};
	} catch (err) {
		if (err instanceof ApiError) throw error(err.status || 500);
		throw error(503);
	}
};
```

### Creación — `create/+page.server.ts`

```typescript
import { createCreateLoad } from '$lib/server/backoffice/createLoad';
import { createCreateAction } from '$lib/server/backoffice/createAction';
import { zod } from 'sveltekit-superforms/adapters';
import { resourceFormSchema } from '../schemas/resource-form.schema';
import { RESOURCE_REQUEST } from '$core/[resource]/requests';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';

export const load = createCreateLoad({
	schema: zod(resourceFormSchema),
	initialValues: { name: '', kind: undefined, descriptionShort: '' }
});

export const actions = {
	default: createCreateAction({
		basePath: `${BACKOFFICE_PREFIX}/resources`,
		schema: zod(resourceFormSchema),
		createFn: RESOURCE_REQUEST.create,
		entityName: 'recurso',
		redirectToEdit: true
	})
};
```

### Edición + Borrado — `[id]/edit/+page.server.ts`

```typescript
import type { PageServerLoad, Actions } from './$types';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { ApiError } from '$core/_shared/errors';
import { RESOURCE_REQUEST } from '$core/[resource]/requests';
import { createUpdateAction } from '$lib/server/backoffice/updateAction';
import { createDeleteAction } from '$lib/server/backoffice/deleteAction';
import { resourceFormSchema } from '../../schemas/resource-form.schema';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const item = await RESOURCE_REQUEST.findById(fetch, params.id);
		const form = await superValidate(
			{
				id: item.id,
				name: item.name,
				kind: item.kind,
				descriptionShort: item.descriptionShort ?? ''
			},
			zod(resourceFormSchema)
		);
		return { item, form };
	} catch (err) {
		if (err instanceof ApiError) throw error(err.status || 500);
		throw error(503);
	}
};

export const actions: Actions = {
	update: createUpdateAction({
		basePath: `${BACKOFFICE_PREFIX}/resources`,
		schema: zod(resourceFormSchema),
		updateFn: RESOURCE_REQUEST.update,
		redirectToList: true,
		paramName: 'id',
		transformData: ({ id, ...rest }) => rest
	}),
	delete: createDeleteAction({
		basePath: `${BACKOFFICE_PREFIX}/resources`,
		deleteFn: RESOURCE_REQUEST.delete
	})
};
```

---

## 5. Páginas Svelte

### Listado — `+page.svelte`

```svelte
<script lang="ts">
	/**
	 * Resource list page.
	 * Filterable, sortable, paginated table.
	 */
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const items = $derived(data.items);
</script>
```

Patrones clave:

- Usar `PageProps` (no `{ data: PageData }`)
- Usar `$derived` para valores computados desde `data`
- Usar `$state` + `$effect` para estado local de inputs que se sincroniza con filtros URL

### Crear — `create/+page.svelte`

```svelte
<script lang="ts">
	/**
	 * Create resource page.
	 */
	import * as m from '$paraglide/messages';
	import type { PageProps } from './$types';
	import ResourceForm from '../components/ResourceForm.svelte';

	let { data }: PageProps = $props();
</script>

<ResourceForm form={data.form} mode="create" />
```

### Editar — `[id]/edit/+page.svelte`

```svelte
<script lang="ts">
	/**
	 * Edit resource page.
	 */
	import * as m from '$paraglide/messages';
	import type { PageProps } from './$types';
	import ResourceForm from '../../components/ResourceForm.svelte';

	let { data }: PageProps = $props();
</script>

<ResourceForm form={data.form} mode="edit" resourceId={data.item.id} />
```

---

## 6. Formulario (`ResourceForm.svelte`)

Un único componente para create y edit. El form se recibe directamente como prop (sin wrapper):

```svelte
<script lang="ts">
	/**
	 * ResourceForm — Shared form for creating and editing resources.
	 */
	import * as m from '$paraglide/messages';
	import { superForm } from 'sveltekit-superforms';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { ResourceFormSchema } from '../schemas/resource-form.schema';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormSelect from '$lib/components/backoffice/forms/FormSelect.svelte';
	import ResourceFormActions from './ResourceFormActions.svelte';

	type Props = {
		form: SuperValidated<ResourceFormSchema>;
		mode: 'create' | 'edit';
		resourceId?: string;
	};

	let { form: formData, mode, resourceId }: Props = $props();

	const isEditMode = $derived(mode === 'edit');
	const formAction = $derived(isEditMode ? '?/update' : undefined);

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance } = superForm(formData, { dataType: 'json' });

	const formId = 'resource-form';
</script>

<ResourceFormActions {mode} {resourceId} {formId} />

<form id={formId} method="POST" action={formAction} use:enhance>
	<FormInputText
		id="name"
		label={m.resources_labelName()}
		bind:value={$form.name}
		error={$errors.name}
	/>
</form>
```

---

## 7. Barra de acciones (`ResourceFormActions.svelte`)

**Importante:** El form de borrado DEBE usar `use:enhance` para evitar un full page reload.

```svelte
<script lang="ts">
	/**
	 * ResourceFormActions — Action bar with back, delete, and submit buttons.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { confirmAction } from '$lib/actions/backoffice/confirmAction';
	import { RESOURCE_ROUTES } from '$lib/config/routes/backoffice/resources';

	type Props = {
		mode: 'create' | 'edit';
		resourceId?: string;
		formId: string;
	};

	let { mode, resourceId, formId }: Props = $props();

	const isCreateMode = $derived(mode === 'create');
	const isEditMode = $derived(mode === 'edit');
</script>

<div class="bnd-main-actions ...">
	<a href={`${RESOURCE_ROUTES.list}?${page.url.searchParams.toString()}`} class="btn btn-ghost">
		← {m.resources_backToList()}
	</a>

	{#if isEditMode && resourceId}
		<form method="POST" action={`${RESOURCE_ROUTES.edit(resourceId)}?/delete`} class="ml-auto" use:enhance>
			<button type="submit" class="btn btn-soft btn-error"
				use:confirmAction={{ title: m.resources_confirmDeleteTitle(), ... }}>
				{m.resources_deleteButton()}
			</button>
		</form>
	{/if}

	<button form={formId} type="submit" class="btn btn-outline btn-primary" class:ml-auto={isCreateMode}>
		{isCreateMode ? m.resources_create() : m.resources_saveChanges()}
	</button>
</div>
```

---

## 8. Queries del lado del cliente

**Archivo:** `queries/resource-search.queries.ts`

Para componentes de búsqueda asíncrona que necesitan hacer fetch desde el browser:

```typescript
/**
 * Client-side search queries for the resource form.
 * Maps API responses to SearchResult format for FormAsyncSearch.
 */
import type { SearchResult } from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';
import { RESOURCE_REQUEST } from '$core/[resource]/requests';

export async function searchResources(query: string): Promise<SearchResult[]> {
	try {
		const result = await RESOURCE_REQUEST.findByCriteria(fetch, { query, limit: 10 });
		return (result.data ?? []).map((item) => ({
			value: item.id,
			label: item.name
		}));
	} catch {
		return [];
	}
}
```

> Siempre usar las funciones de `$core` — nunca `fetch()` con URLs construidas manualmente.

---

## 9. Rutas del recurso

**Archivo:** `src/lib/config/routes/backoffice/[resource].ts`

```typescript
import { backoffice } from '../core';

export const RESOURCE_ROUTES = {
	list: backoffice('resources'),
	create: backoffice('resources/create'),
	edit: (id: string) => backoffice('resources', id, 'edit')
};
```

---

## 10. Componentes de formulario disponibles

En `src/lib/components/backoffice/forms/`:

| Componente             | Uso                                      |
| ---------------------- | ---------------------------------------- |
| `FormInputText`        | Input texto, url, número                 |
| `FormInputSlug`        | Slug con autogeneración desde otro campo |
| `FormSelect`           | Dropdown con opciones `{id, name}[]`     |
| `FormTextarea`         | Texto multilínea                         |
| `FormTextareaMarkdown` | Editor markdown                          |
| `FormCheckboxGroup`    | Checkboxes múltiples                     |
| `FormTagManager`       | Gestión de tags                          |
| `FormAsyncSearch`      | Búsqueda asíncrona con debounce          |
| `layout/FormAccordion` | Sección colapsable con título            |

---

## Checklist para un CRUD nuevo

- [ ] Tipos, DTOs y Criteria en `src/core/[resource]/types.ts`
- [ ] Enums en `src/core/[resource]/enums.ts`
- [ ] Funciones de request en `src/core/[resource]/requests.ts`
- [ ] Schema Zod en `schemas/[resource]-form.schema.ts`
- [ ] Schema de filtros en `schemas/filters.schema.ts`
- [ ] Claves i18n en `messages/{locale}/[resource].json`
- [ ] Rutas en `src/lib/config/routes/backoffice/[resource].ts`
- [ ] Ficheros de ruta: `+page`, `create/`, `[id]/edit/`
- [ ] `ResourceForm.svelte` + `ResourceFormActions.svelte`
- [ ] Queries en `queries/` si se necesita búsqueda asíncrona
- [ ] `use:enhance` en TODOS los forms (crear, actualizar, borrar)
- [ ] `PageProps` para tipado de props de página (no `{ data: PageData }`)
