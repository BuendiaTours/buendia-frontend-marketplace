# Guía: Crear una sección CRUD en el Backoffice

> Ejemplo de referencia: sección **Destinations**
> `src/routes/(backoffice)/backoffice/destinations/`

---

## Estructura de ficheros

```
backoffice/[resource]/
├── +page.svelte                  ← Listado
├── +page.server.ts               ← Load del listado (filtros + API)
├── create/
│   ├── +page.svelte              ← Formulario de creación
│   └── +page.server.ts           ← Load + action de creación
├── [slug]/
│   ├── +page.svelte              ← Vista detalle (read-only)
│   ├── +page.server.ts           ← Load del detalle
│   ├── edit/
│   │   ├── +page.svelte          ← Formulario de edición
│   │   └── +page.server.ts       ← Load + action de edición
│   └── delete/
│       ├── +page.svelte          ← Vacío (solo existe por requerimiento de SK)
│       └── +page.server.ts       ← Action de borrado
├── components/
│   └── ResourceForm.svelte       ← Formulario compartido (create + edit)
└── schemas/
    ├── resource-form.schema.ts   ← Schema Zod del formulario
    └── filters.schema.ts         ← Schema de filtros URL
```

---

## 1. Tipos TypeScript

**Archivo:** [`src/lib/types.ts`](src/lib/types.ts)

Todos los tipos del proyecto van aquí. Añadir el tipo del recurso:

```typescript
export type Destination = {
	id: string;
	name: string;
	slug: string;
	kind: DestinationKind;
	descriptionShort: string;
	photoUrlHero: string;
};
```

---

## 2. Endpoints API

**Archivo:** [`src/lib/api/backoffice/endpoints/destinations.ts`](src/lib/api/backoffice/endpoints/destinations.ts)
**Rutas:** [`src/lib/api/shared/endpoints.config.ts`](src/lib/api/shared/endpoints.config.ts)

Primero definir la ruta en `endpoints.config.ts`, luego implementar el módulo:

```typescript
// endpoints/destinations.ts
import { get, getWithParams, post, patch, del } from '$core/_shared/helpers';

const BASE = '/destinations';

export const DESTINATION_REQUEST = {
	findByCriteria: (fetch, criteria?) => getWithParams(fetch, BASE, criteria),
	findBySlug: (fetch, slug) => get(fetch, `${BASE}/slug/${slug}`),
	create: (fetch, data) => post(fetch, BASE, data),
	update: (fetch, id, data) => patch(fetch, `${BASE}/${id}`, data),
	delete: (fetch, id) => del(fetch, `${BASE}/${id}`)
};
```

> Nunca usar `fetch()` directamente. Siempre pasar el `fetch` de SvelteKit.

---

## 3. Schema de validación (Zod)

**Archivo:** `schemas/destination-form.schema.ts`

```typescript
import { z } from 'zod/v3';
import { DestinationKind } from '$core/destinations/enums';

export const destinationFormSchema = z.object({
	id: z.string(),
	name: z.string().min(2).max(100),
	slug: z.string().min(2).max(100),
	kind: z.nativeEnum(DestinationKind),
	descriptionShort: z.string().min(10).max(500),
	photoUrlHero: z.string().url()
});

export type DestinationFormSchema = z.infer<typeof destinationFormSchema>;
```

---

## 4. Filtros URL

**Archivo:** `schemas/filters.schema.ts`
**Utilidades:** [`src/lib/utils/filters.ts`](src/lib/utils/filters.ts)

La URL es la única fuente de verdad para filtros, paginación y orden:

```typescript
import { createPageField, createSortField, createOrderField } from '$lib/utils/filters';

export const destinationsFiltersSchema = {
	fields: {
		page: createPageField(),
		sort: createSortField(['id', 'name', 'slug'] as const),
		order: createOrderField(),
		q: {
			parse: (raw) => raw || undefined,
			serialize: (val, out) => (val ? out.set('q', val) : out.delete('q')),
			resetPageOnChange: true
		}
	}
};
```

---

## 5. Server factories (CRUD sin boilerplate)

**Directorio:** [`src/lib/server/backoffice/`](src/lib/server/backoffice/)

Las factories generan el 90% del código repetitivo. Son las mismas para todos los recursos.

### Listado — `+page.server.ts`

```typescript
import { parseFilters } from '$lib/utils/filters';
import { destinationsFiltersSchema } from './schemas/filters.schema';
import { DESTINATION_REQUEST } from '$core/destinations/requests';
import { buildPagination } from '$core/_shared/params';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const filters = parseFilters(destinationsFiltersSchema, url.searchParams);
	const response = await DESTINATION_REQUEST.findByCriteria(fetch, filters);
	return {
		items: response.data,
		pagination: buildPagination(response.total, filters.page, filters.pageSize),
		filters
	};
};
```

### Creación — `create/+page.server.ts`

```typescript
import { createCreateLoad }   from '$lib/server/backoffice/createLoad'
import { createCreateAction } from '$lib/server/backoffice/createAction'
import { zod } from 'sveltekit-superforms/adapters'

export const load    = createCreateLoad({
  schema: zod(destinationFormSchema),
  initialValues: { name: '', slug: '', kind: undefined, ... }
})

export const actions = {
  default: createCreateAction({
    basePath:  '/backoffice/destinations',
    schema:    zod(destinationFormSchema),
    createFn:  DESTINATION_REQUEST.create,
    entityName: 'destino',
    redirectToEdit: true
  })
}
```

### Edición — `[slug]/edit/+page.server.ts`

```typescript
export const load: PageServerLoad = async ({ fetch, params }) => {
	const item = await DESTINATION_REQUEST.findBySlug(fetch, params.slug);
	const form = await superValidate({ ...item }, zod(destinationFormSchema));
	return { item, form };
};

export const actions = {
	default: createUpdateAction({
		basePath: '/backoffice/destinations',
		schema: zod(destinationFormSchema),
		updateFn: DESTINATION_REQUEST.update
	})
};
```

### Borrado — `[slug]/delete/+page.server.ts`

```typescript
export const actions = {
	default: createDeleteAction({
		basePath: '/backoffice/destinations',
		deleteFn: DESTINATION_REQUEST.delete
	})
};
```

---

## 6. Formulario Svelte (`ResourceForm.svelte`)

Un único componente para create y edit, con prop `mode: 'create' | 'edit'`:

```svelte
<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormSelect from '$lib/components/backoffice/forms/FormSelect.svelte';

	let { data, mode } = $props();
	const { form, errors, enhance } = superForm(data.form, { dataType: 'json' });
</script>

<form method="POST" use:enhance>
	<FormInputText id="name" label="Nombre" bind:value={$form.name} error={$errors.name} />

	<FormSelect
		id="kind"
		label="Tipo"
		bind:value={$form.kind}
		error={$errors.kind}
		options={DESTINATION_KIND_OPTIONS}
	/>

	<button type="submit">
		{mode === 'create' ? 'Crear' : 'Guardar'}
	</button>
</form>
```

**Componentes de formulario disponibles** en [`src/lib/components/backoffice/forms/`](src/lib/components/backoffice/forms/):

| Componente             | Uso                                      |
| ---------------------- | ---------------------------------------- |
| `FormInputText`        | Input texto, url, número                 |
| `FormInputSlug`        | Slug con autogeneración desde otro campo |
| `FormSelect`           | Dropdown con opciones `{id, name}[]`     |
| `FormTextarea`         | Texto multilínea                         |
| `FormTextareaMarkdown` | Editor markdown                          |
| `FormCheckboxGroup`    | Checkboxes múltiples                     |
| `FormTagManager`       | Gestión de tags                          |
| `layout/FormAccordion` | Sección colapsable con título            |

---

## 7. Rutas del recurso

**Archivo:** `src/lib/config/routes/backoffice/[resource].ts`

```typescript
import { backoffice } from '../core';

export const DESTINATION_ROUTES = {
	list: backoffice('destinations'),
	create: backoffice('destinations/create'),
	detail: (slug: string) => backoffice('destinations', slug),
	edit: (slug: string) => backoffice('destinations', slug, 'edit'),
	delete: (slug: string) => backoffice('destinations', slug, 'delete')
};
```

---

## 8. Flujo completo

```
GET  /backoffice/destinations          → listado con filtros
GET  /backoffice/destinations/create   → form vacío con UUID pre-generado
POST /backoffice/destinations/create   → valida → POST API → redirect a edit
GET  /backoffice/destinations/[slug]/edit  → form pre-rellenado desde API
POST /backoffice/destinations/[slug]/edit  → valida → PATCH API → redirect a edit
POST /backoffice/destinations/[slug]/delete → DELETE API → redirect a listado
```

---

## 9. Checklist para un CRUD nuevo

- [ ] Tipo en `src/lib/types.ts`
- [ ] Enums en `$core/[resource]/enums.ts`
- [ ] Rutas en `endpoints.config.ts`
- [ ] Módulo API en `src/lib/api/backoffice/endpoints/[resource].ts`
- [ ] Schema Zod en `schemas/[resource]-form.schema.ts`
- [ ] Schema de filtros en `schemas/filters.schema.ts`
- [ ] Rutas del recurso en `src/lib/config/routes/backoffice/[resource].ts`
- [ ] Ficheros de ruta: `+page`, `create/`, `[slug]/`, `[slug]/edit/`, `[slug]/delete/`
- [ ] Componente `ResourceForm.svelte` compartido

---

## Convenciones importantes

- **Svelte 5**: Solo `$state()`, `$props()`, `$derived()`, `$effect()`. Sin `export let` ni `$:`.
- **Styling**: Solo Tailwind CSS v4 + DaisyUI. Sin estilos inline ni CSS modules.
- **Tipos**: `import type { ... }` para imports de solo tipo. `type` en vez de `interface`.
- **Each blocks**: Siempre con key: `{#each items as item (item.id)}`.
- **Maps**: `new SvelteMap()` en vez de `new Map()`.
