You are a senior frontend engineer with strong UX expertise. Generate a complete backoffice CRUD section for a resource using its `src/core/` domain layer as source of truth.

## Input

`$ARGUMENTS` is the path to a core resource directory (e.g., `src/core/locations`). Read ALL files there (`types.ts`, `enums.ts`, `requests.ts`) and extract:

- **Resource name** — singular and plural (e.g., `attraction` / `attractions`)
- **Projection type** — main read model
- **CreateDto / UpdateDto** — writable fields (ONLY these go in the form schema)
- **Enums** — status, kind, etc.
- **Criteria type** — filterable/sortable fields
- **Relations** — embedded types that map to `{id, name}` arrays in the form
- **Coordinates** — whether the resource has lat/lng fields (map to GeoJSON in the form)

## UX decisions

After analyzing the core types, decide — like a senior frontend engineer focused on usability — the following. Explain your reasoning briefly before generating code.

### List table columns

Choose which fields to show in the table based on what helps the user **scan, identify, and act** on items quickly. Apply these criteria:

- **Always show:** name/title as a clickable link to edit (with description subtitle if available)
- **Show if useful:** status (with color indicator), type/kind, key relations as Tag chips, dates (formatted)
- **Never show:** internal IDs, long text fields, coordinates, technical fields (createdAt/updatedAt unless relevant)
- **Column count:** aim for 3-5 data columns max — fewer is better. A crowded table is worse than a sparse one
- **Sortable columns:** only mark columns as sortable if the Criteria type supports sorting by that field

### List filters

Choose which filters to expose based on what helps the user **narrow down results** effectively:

- **Always include:** text search (`q`)
- **Include if the enum has 3+ values:** status, kind, type — as `FilterSelect` dropdowns
- **Skip:** boolean filters unless they represent a primary workflow distinction, fields the API Criteria doesn't support
- **Rule:** every filter in the UI must map to a field in the Criteria type — don't add filters the API can't handle

### Form sections

Group form fields into logical `FormAccordion` sections (all open by default) based on semantic meaning:

- **Main data** (always first): name, status/kind, descriptions — the fields the user fills first
- **Additional sections** only if there's a clear semantic boundary — examples:
  - "Location" section: address, coordinates, map — when the resource is a physical place
  - "Relations" section: linked entities — when there are 2+ relation fields
  - "Configuration" section: settings, flags, options — when there are boolean/config fields
- **Don't over-split:** if the resource has ≤5 fields total, use a single section. Splitting a 4-field form into 2 sections adds clicks without clarity
- **Don't under-split:** if the resource has 10+ fields, group them — a single scroll of 15 fields is overwhelming

### Field order within sections

Order fields by importance and workflow:

1. Name/title — always first (it's the identity)
2. Status/kind — right after name (determines behavior)
3. Short descriptions — before long ones
4. Relations — grouped together
5. Address/coordinates — together at the end of their section
6. Technical/optional fields — last

## Naming conventions

Throughout all snippets, replace these placeholders:

| Placeholder   | Example (attraction) |
| ------------- | -------------------- |
| `{Resource}`  | `Attraction`         |
| `{resource}`  | `attraction`         |
| `{resources}` | `attractions`        |
| `{RESOURCE}`  | `ATTRACTION`         |

---

## Files to generate

### 1. Route config — `src/lib/config/routes/backoffice/{resources}.ts`

```typescript
import { backoffice } from '../core';

export const {RESOURCE}_ROUTES = {
	list: backoffice('{resources}'),
	create: backoffice('{resources}/create'),
	edit: (id: string) => backoffice('{resources}', id, 'edit')
} as const;
```

Then update `src/lib/config/routes/backoffice/index.ts`: add the import and add `{resources}: {RESOURCE}_ROUTES` to `backofficeRoutes`.

Then update `src/lib/utils/breadcrumbsBackoffice.ts`:

- Add `{resources}: '...'` (Spanish plural label) to the `routeLabels` map.
- Add `{resources}: ROUTES.backoffice.{resources}.list` to the `sectionRoutes` map inside `buildBreadcrumbs`.

### 2. Labels — `src/lib/labels/{resources}.ts`

One options array per enum. The i18n keys follow `enum_{resource}{EnumName}_{lowerValue}` pattern.

```typescript
import { {Resource}Status } from '$core/{resources}/enums';
import * as m from '$paraglide/messages';

export const {RESOURCE}_STATUS_OPTIONS = [
	{ id: {Resource}Status.ACTIVE, name: m.enum_{resource}Status_active() },
	{ id: {Resource}Status.DRAFT, name: m.enum_{resource}Status_draft() },
	// ... one per enum value
];
```

### 3. i18n — `messages/es/{resources}.json`

```json
{
	"$schema": "https://inlang.com/schema/inlang-message-format",
	"{resources}_breadcrumbResource": "...",
	"{resources}_breadcrumbNew": "Nuevo/a ...",
	"{resources}_editPageTitle": "Editar ...",
	"{resources}_createPageTitle": "Nuevo/a ...",
	"{resources}_backToList": "Volver al listado",
	"{resources}_createResource": "Crear ...",
	"{resources}_confirmDeleteTitle": "Eliminar elemento",
	"{resources}_confirmDeleteMessage": "Estas seguro de que quieres eliminar este elemento?",
	"{resources}_deleteButton": "Borrar",
	"{resources}_editButton": "Editar",
	"{resources}_saveChanges": "Guardar cambios",
	"{resources}_sectionMainData": "Datos principales",
	"{resources}_sectionMainDataDescription": "...",
	"{resources}_label{Field}": "...",
	"{resources}_placeholder{Field}": "...",
	"{resources}_listPageTitle": "...",
	"{resources}_listTitle": "Listado de ...",
	"{resources}_searchPlaceholder": "Buscar ...",
	"{resources}_filter{Enum}Placeholder": "Selecciona ...",
	"{resources}_filter{Enum}Clear": "Limpia ...",
	"{resources}_newResource": "Nuevo/a ...",
	"{resources}_column{Field}": "...",
	"{resources}_emptyState": "No se encontraron elementos"
}
```

Add extra section keys (`{resources}_section{Name}`, `{resources}_section{Name}Description`) if the form has multiple accordion groups. Add `enum_{resource}{EnumName}_{value}` keys for each enum value used in labels.

Then update `project.inlang/settings.json`: add `"./messages/{locale}/{resources}.json"` to `pathPattern` array.

### 4. Form schema — `schemas/{resource}-form.schema.ts`

```typescript
import { z } from 'zod/v3';
import { {Resource}Status } from '$core/{resources}/enums';

export const {resource}FormSchema = z.object({
	id: z.string(),
	name: z.string().min(2).max(100),
	status: z.nativeEnum({Resource}Status),
	// string fields → z.string().min(N).max(N)
	// enum fields → z.nativeEnum(Enum)
	// relation fields → z.array(z.object({ id: z.string(), name: z.string() })).default([])
	// coordinates → z.object({ type: z.literal('Point'), coordinates: z.tuple([z.number(), z.number()]) }).nullable().default(null)
});

export type {Resource}FormSchema = z.infer<typeof {resource}FormSchema>;
```

**Rules:** Only include fields from CreateDto/UpdateDto + `id`. Never add projection-only fields.

### 5. Filters schema — `schemas/filters.schema.ts`

```typescript
import type { FiltersSchema } from '$lib/utils/filters';
import { createOrderField, createSortField } from '$lib/utils/filters';
import type { CriteriaSortOption } from '$core/_shared/enums';
// import enums used as filters

export type {Resources}Filters = {
	page?: number;
	pageSize?: number;
	sort?: 'id' | 'name' | /* sortable fields from Criteria */;
	order?: CriteriaSortOption;
	q?: string;
	// one field per enum filter: status?: {Resource}Status;
};

export const {resources}FiltersSchema: FiltersSchema<{Resources}Filters> = {
	fields: {
		page: {
			parse: (raw) => { if (!raw) return undefined; const num = parseInt(raw, 10); return num > 0 ? num : undefined; },
			serialize: (value, out) => { if (value !== undefined) { out.set('page', String(value)); } else { out.delete('page'); } },
			resetPageOnChange: false
		},
		pageSize: {
			parse: (raw) => { if (!raw) return undefined; const num = parseInt(raw, 10); return num > 0 ? num : undefined; },
			serialize: (value, out) => { if (value !== undefined) { out.set('pageSize', String(value)); } else { out.delete('pageSize'); } },
			resetPageOnChange: false
		},
		sort: createSortField([/* sortable fields */] as const),
		order: createOrderField(),
		q: {
			parse: (raw) => raw || undefined,
			serialize: (value, out) => { if (value) { out.set('q', value); } else { out.delete('q'); } },
			resetPageOnChange: true
		},
		// For each enum filter field:
		// {enumField}: {
		//   parse: (raw) => Object.values(Enum).includes(raw as Enum) ? raw as Enum : undefined,
		//   serialize: (value, out) => { if (value) { out.set('{enumField}', value); } else { out.delete('{enumField}'); } },
		//   resetPageOnChange: true
		// }
	}
};
```

### 6. FormActions component — `components/{Resource}FormActions.svelte`

```svelte
<script lang="ts">
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { confirmAction } from '$lib/actions/backoffice/confirmAction';
	import { {RESOURCE}_ROUTES } from '$lib/config/routes/backoffice/{resources}';

	type Props = {
		mode: 'create' | 'edit';
		{resource}Id?: string;
		formId: string;
	};

	let { mode, {resource}Id, formId }: Props = $props();

	const isCreateMode = $derived(mode === 'create');
	const isEditMode = $derived(mode === 'edit');
</script>

<div class="bnd-main-actions border-base-content/10 bg-base-100 sticky top-0 z-10 flex items-center justify-between gap-4 border-t py-4">
	<a href={`${{RESOURCE}_ROUTES.list}?${page.url.searchParams.toString()}`} class="btn btn-ghost">
		← {m.{resources}_backToList()}
	</a>

	{#if isEditMode && {resource}Id}
		<form method="POST" action={`${{RESOURCE}_ROUTES.edit({resource}Id)}?/delete`} class="ml-auto" use:enhance>
			<button type="submit" class="btn btn-soft btn-error"
				use:confirmAction={{
					title: m.{resources}_confirmDeleteTitle(),
					message: m.{resources}_confirmDeleteMessage(),
					confirmText: m.common_delete(),
					cancelText: m.common_cancel(),
					danger: true
				}}
			>
				{m.{resources}_deleteButton()}
			</button>
		</form>
	{/if}

	<button form={formId} type="submit" class="btn btn-outline btn-primary" class:ml-auto={isCreateMode}>
		{isCreateMode ? m.{resources}_createResource() : m.{resources}_saveChanges()}
	</button>
</div>
```

### 7. Form component — `components/{Resource}Form.svelte`

```svelte
<script lang="ts">
	import * as m from '$paraglide/messages';
	import { superForm } from 'sveltekit-superforms';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { {Resource}FormSchema } from '../schemas/{resource}-form.schema';
	import { {RESOURCE}_STATUS_OPTIONS } from '$lib/labels/{resources}';
	import { Database } from '$lib/icons/Linear';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	// import form components as needed: FormInputText, FormSelect, FormTextarea, etc.
	import {Resource}FormActions from './{Resource}FormActions.svelte';

	type Props = {
		form: SuperValidated<{Resource}FormSchema>;
		mode: 'create' | 'edit';
		{resource}Id?: string;
		// add available{Relation} props if needed
	};

	let { form: formData, mode, {resource}Id /*, available... */ }: Props = $props();

	const isEditMode = $derived(mode === 'edit');
	const formAction = $derived(isEditMode ? '?/update' : undefined);

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance } = superForm(formData, { dataType: 'json' });

	const formId = '{resource}-form';
</script>

<{Resource}FormActions {mode} {{resource}Id} {formId} />

<form id={formId} method="POST" action={formAction} use:enhance class="space-y-4">
	<FormAccordion name="form-{resource}-data" open>
		{#snippet title()}
			<Database class="size-6" />
			<span>{m.{resources}_sectionMainData()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.{resources}_sectionMainDataDescription()}</p>
		{/snippet}
		{#snippet content()}
			<input type="hidden" name="id" value={$form.id} />
			<!-- Form fields here using bind:value={$form.field} error={$errors.field} -->
		{/snippet}
	</FormAccordion>

	<!-- Add more FormAccordion sections if fields group logically (all open by default) -->
</form>
```

**Field → component mapping:**
| Field type | Component | Notes |
|---|---|---|
| Short string | `FormInputText` | `wrapperClass="md:col-span-N"` |
| Enum | `FormSelect` | Pass options array + placeholder |
| Short text | `FormTextarea` | `rows={2-3}` |
| Long/markdown text | `FormTextareaMarkdown` | |
| Relation array `{id,name}[]` | `FormOrderedObjectList` | Pass `availableItems`, `placeholder`, `emptyMessage` |
| Coordinates (GeoJSON) | `FormGeoJson` | `config={{ showSearchBox: true }}`, `error={$errors.field?._errors}` |
| Parent/FK search | `FormAsyncSearch` | Needs a query file in `queries/` |

### 8. List page server — `+page.server.ts`

```typescript
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { {resources}FiltersSchema } from './schemas/filters.schema';
import { {RESOURCE}_REQUEST } from '$core/{resources}/requests';
import type { {Resource}Criteria } from '$core/{resources}/types';
import { ApiError } from '$core/_shared/errors';
import { buildPagination } from '$core/_shared/params';
import { parseFilters } from '$lib/utils/filters';
import { generateBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const filters = parseFilters({resources}FiltersSchema, url.searchParams);
	try {
		const breadcrumbs = generateBreadcrumbs(url.pathname);
		const response = await {RESOURCE}_REQUEST.findByCriteria(fetch, {
			page: filters.page,
			pageSize: filters.pageSize,
			sort: filters.sort,
			order: filters.order,
			query: filters.q,
			// map each filter field to its Criteria equivalent
		} as {Resource}Criteria);

		return {
			items: response.data || [],
			pagination: buildPagination(response.total, filters.page, filters.pageSize),
			filters,
			sort: filters.sort && filters.order ? { field: filters.sort, order: filters.order } : null,
			breadcrumbs
		};
	} catch (err) {
		if (err instanceof ApiError) { throw error(err.status || 500); }
		throw error(503);
	}
};
```

### 9. List page — `+page.svelte`

Structure: `PageProps` → derived state → filter functions → template with:

1. `<LocationBar>` with i18n title + breadcrumbs
2. Filter bar: search input + `FilterSelect` per enum + create button (`ml-auto`)
3. Table with explicit rendering (no column iteration):
   - Name column (sortable via `TableSortableHeader`) — link to edit + optional description subtitle
   - Relevant data columns — use `Tag` component for relation badges
   - Status column — colored `status` indicator + label from options
   - Actions column — dropdown with edit link
4. `<Pagination>` at bottom

Use `$derived` for items/pagination/filters/sort. Use `patchFilters` + `goto` for filter changes. Always key `{#each}` blocks with `(item.id)` or `(relation.id)`.

### 10. Create page server — `create/+page.server.ts`

```typescript
import { createCreateLoad } from '$lib/server/backoffice/createLoad';
import { createCreateAction } from '$lib/server/backoffice/createAction';
import { {resource}FormSchema, type {Resource}FormSchema } from '../schemas/{resource}-form.schema';
import { {RESOURCE}_REQUEST } from '$core/{resources}/requests';
import { zod } from 'sveltekit-superforms/adapters';
import { {Resource}Status } from '$core/{resources}/enums';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import type { PageServerLoad, Actions } from './$types';

// Define AvailableData type if loading relations
// type AvailableData = { available{Relations}: Array<{ id: string; name: string }> };

export const load: PageServerLoad = createCreateLoad<{Resource}FormSchema>({
	schema: zod({resource}FormSchema),
	initialValues: {
		name: '',
		status: {Resource}Status.DRAFT,
		// empty defaults for each field — '' for strings, [] for arrays, null for nullable
	},
	// loadAvailableData: async (fetch) => ({ ... }) — only if relations exist
});

export const actions: Actions = {
	default: createCreateAction({
		basePath: `${BACKOFFICE_PREFIX}/{resources}`,
		schema: zod({resource}FormSchema),
		createFn: {RESOURCE}_REQUEST.create,
		redirectToList: true,
		// transformData converts form shape → API DTO shape:
		// - GeoJSON location → latitude/longitude
		// - relation arrays → ID arrays (e.g., destinations → locationIds)
		// - strip form-only fields (e.g., id is sent by the factory)
		transformData: (formData) => ({ ...formData })
	})
};
```

### 11. Create page — `create/+page.svelte`

```svelte
<script lang="ts">
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import {Resource}Form from '../components/{Resource}Form.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: PageProps = $props();
	const breadcrumbs = $derived(
		buildBreadcrumbs(page.url.pathname, { label: m.{resources}_breadcrumbNew() })
	);
</script>

<svelte:head><title>{m.{resources}_createPageTitle()} - Backoffice</title></svelte:head>
<LocationBar title={m.{resources}_createPageTitle()} {breadcrumbs} />
<{Resource}Form form={data.form} mode="create" /* pass available{Relation}={data.available{Relation}} if needed */ />
```

### 12. Edit page server — `[id]/edit/+page.server.ts`

```typescript
import { {RESOURCE}_REQUEST } from '$core/{resources}/requests';
import { ApiError } from '$core/_shared/errors';
import { {resource}FormSchema } from '../../schemas/{resource}-form.schema';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { BACKOFFICE_PREFIX } from '$lib/config/routes';
import { createUpdateAction } from '$lib/server/backoffice/updateAction';
import { createDeleteAction } from '$lib/server/backoffice/deleteAction';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const {resource} = await {RESOURCE}_REQUEST.findById(fetch, params.id);
		// If loading relations: const [{resource}, relationsResponse] = await Promise.all([...]);

		const form = await superValidate(
			{
				id: {resource}.id,
				// Map each field from API response → form value
				// - strings: {resource}.field ?? ''
				// - relations: {resource}.{relations}.map(r => ({ id: r.id, name: r.name }))
				// - coordinates: {resource}.coordinates != null ? { type: 'Point', coordinates: [lng, lat] } : null
			},
			zod({resource}FormSchema)
		);

		return { {resource}, form /*, available{Relations}: ... */ };
	} catch (err) {
		if (err instanceof ApiError) { throw error(err.status || 500); }
		throw error(503);
	}
};

export const actions: Actions = {
	update: createUpdateAction({
		basePath: `${BACKOFFICE_PREFIX}/{resources}`,
		schema: zod({resource}FormSchema),
		updateFn: {RESOURCE}_REQUEST.update,
		redirectToList: true,
		paramName: 'id',
		// transformData: same conversion as create
	}),
	delete: createDeleteAction({
		basePath: `${BACKOFFICE_PREFIX}/{resources}`,
		deleteFn: {RESOURCE}_REQUEST.delete
	})
};
```

### 13. Edit page — `[id]/edit/+page.svelte`

```svelte
<script lang="ts">
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import {Resource}Form from '../../components/{Resource}Form.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: PageProps = $props();
	const breadcrumbs = $derived(
		buildBreadcrumbs(page.url.pathname, {
			label: data.{resource}.name || m.{resources}_breadcrumbResource()
		})
	);
</script>

<svelte:head><title>{m.{resources}_editPageTitle()} - Backoffice</title></svelte:head>
<LocationBar title={m.{resources}_editPageTitle()} {breadcrumbs} />
<{Resource}Form
	form={data.form}
	mode="edit"
	{resource}Id={data.{resource}.id}
	/* pass available{Relation}={data.available{Relation}} if needed */
/>
```

---

## transformData patterns

The `transformData` function in create/update actions converts form shape → API DTO shape. Common conversions:

| Form field                                             | API DTO field             | Conversion                                                                |
| ------------------------------------------------------ | ------------------------- | ------------------------------------------------------------------------- |
| `location: { type: 'Point', coordinates: [lng, lat] }` | `latitude`, `longitude`   | `latitude: location?.coordinates[1], longitude: location?.coordinates[0]` |
| `destinations: [{id, name}]`                           | `locationIds: string[]`   | `locationIds: (destinations ?? []).map(d => d.id)`                        |
| `{relations}: [{id, name}]`                            | `{relation}Ids: string[]` | `{relation}Ids: ({relations} ?? []).map(r => r.id)`                       |
| `id`                                                   | _(strip in update)_       | Destructure out: `({ id, ...rest }) => ({ ...rest, ... })`                |

---

## Common components

### Form fields (from `$lib/components/backoffice/forms/`)

| Component               | Use for                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| `FormInputText`         | Short strings, numbers, URLs, readonly fields with `badge`                                   |
| `FormSelect`            | Enum fields — pass `options` array + `placeholder`                                           |
| `FormTextarea`          | Short multiline text — set `rows={2-4}`                                                      |
| `FormTextareaMarkdown`  | Long/rich text with markdown preview                                                         |
| `FormOrderedObjectList` | Relation arrays `{id, name}[]` — pass `availableItems`, `placeholder`, `emptyMessage`        |
| `FormGeoJson`           | Coordinates (lat/lng) — `config={{ showSearchBox: true }}`, `error={$errors.field?._errors}` |
| `layout/FormAccordion`  | Groups fields into collapsible sections with icon + title + description                      |

### List page (from `$lib/components/backoffice/`)

| Component                    | Use for                                             |
| ---------------------------- | --------------------------------------------------- |
| `Tag`                        | Relation badges in table cells (e.g., destinations) |
| `filters/FilterSelect`       | Enum filter dropdowns in the filter bar             |
| `tables/TableSortableHeader` | Sortable column headers                             |
| `tables/TableResetSort`      | Reset sort button in table header                   |
| `MeltPagination`             | Pagination below the table                          |

If a field type doesn't match any of the above, browse `src/lib/components/backoffice/` for other available components (e.g., `FormAsyncSearch`, `FormCheckboxGroup`, `FormTagManager`, `FormOrderedStringList`, `FormInputSlug`, `MeltCalendar`, `StarRating`).

---

## Available icons (from `$lib/icons/Linear`)

Use for `FormAccordion` titles: `Database` (main data), `MapPoint` (location/geo), `FolderCheck` (categorization), `Link` (relations), `ChecklistMinimalistic` (includes/excludes), `Map` (itinerary).

---

### 14. Navigation link — `src/lib/layout/backoffice/Header.svelte`

Add the new resource to the backoffice topbar navigation. The Header has **two menu lists** (mobile dropdown + desktop horizontal) that must stay in sync.

Ensure `import * as m from '$paraglide/messages'` is present in the `<script>` block.

Add a `<li>` entry in **both** menus, placed before the "Componentes" item (which is always last):

```svelte
<!-- In BOTH the mobile <ul class="dropdown-content menu"> AND the desktop <ul class="menu menu-horizontal px-1"> -->
<li>
	<a
		href={ROUTES.backoffice.{resources}.list}
		class:menu-active={isActive(ROUTES.backoffice.{resources}.list)}
	>
		{m.{resources}_navLabel()}
	</a>
</li>
```

Add the corresponding i18n key to the resource's translation file (`messages/es/{resources}.json`):

```json
"{resources}_navLabel": "..."
```

The label should be the plural resource name in Spanish (e.g., "Ubicaciones", "Atracciones").

---

## After generating all files

1. Run `npx @inlang/paraglide-js compile --project ./project.inlang`
2. Run `npm run check` — fix any type errors
3. Run `npm run lint` — fix any formatting/lint errors
4. List all created/modified files

## Critical rules

- Follow ALL conventions from `CLAUDE.md`
- Svelte 5 only: `$props()`, `$derived()`, `$state()`, `onclick`, snippets — no legacy
- All user-facing strings via `m.*()` — NEVER hardcode
- Routes use `[id]` parameter — NEVER `[slug]`
- Form schema fields must match API DTOs — no ghost fields
- `use:enhance` on EVERY form including delete
- Key every `{#each}` block: `{#each items as item (item.id)}`
