# CLAUDE.md — Backoffice SvelteKit Application

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SvelteKit backoffice application (admin CRUD panel) that consumes an external REST API. The backend uses **CQRS with event sourcing**, which directly affects how the frontend handles mutations and redirects.

## Commands

```bash
npm run dev              # Dev server (http://localhost:5173)
npm run build            # Production build
npm run preview          # Preview production build
npm run check            # Type-check (svelte-kit sync + svelte-check)
npm run check:watch      # Type-check in watch mode
npm run lint             # Prettier check + ESLint
npm run format           # Auto-format with Prettier
```

## Architecture

### Hexagonal Architecture (Ports & Adapters)

The codebase follows hexagonal architecture. Dependencies **always point inward**:

```
src/core/             → DOMAIN         (innermost — zero framework imports)
src/lib/server/       → APPLICATION    (orchestrate domain, framework-aware)
src/lib/components/   → UI ADAPTERS    (render state, dispatch user intent)
src/lib/utils/        → INFRASTRUCTURE (URL, i18n, formatting)
src/routes/           → DRIVING ADAPTERS (SvelteKit entry points)
```

**The golden rule:** `src/core/` never imports from `src/lib/`, `src/routes/`, or `$app/*`. Everything else may import from `src/core/`.

**Health test:** if `src/core/` could be copy-pasted into a React or vanilla JS project with zero changes, the architecture is healthy.

### Directory Structure

```
src/
├── core/                          # Domain layer (framework-agnostic)
│   ├── _shared/                   # HTTP client, config, helpers, error classes, shared types
│   │   ├── client.ts              # ApiClient class (retry, timeout, auth, error mapping)
│   │   ├── config.ts              # Base URL, timeout, retry policy, headers
│   │   ├── helpers.ts             # get, getWithParams, post, patch, put, del wrappers
│   │   ├── errors.ts              # ApiError class + typed error factories
│   │   ├── types.ts               # ApiResponse, ApiErrorType, CriteriaResult, etc.
│   │   ├── enums.ts               # Shared enums (CriteriaOperator, SortOrder)
│   │   └── params.ts              # URL param builders (skip/limit, pagination)
│   └── [resource]/                # One folder per API resource
│       ├── types.ts               # Projections (read), DTOs (write), Criteria (query)
│       ├── enums.ts               # Resource-specific enums (mirror backend contract)
│       └── requests.ts            # CRUD + criteria request functions
│
├── lib/
│   ├── components/
│   │   └── backoffice/
│   │       ├── forms/             # Form components (FormInputText, FormSelect, etc.)
│   │       └── ...                # Tables, pagination, filters, dialogs
│   ├── server/
│   │   └── backoffice/            # Server-side action factories
│   │       ├── createAction.ts    # Generic create action factory
│   │       ├── updateAction.ts    # Generic update action factory
│   │       ├── deleteAction.ts    # Generic delete action factory
│   │       ├── createLoad.ts      # Generic create load factory
│   │       ├── flashMessages.ts   # Flash message cookie helpers
│   │       └── auth.ts            # Auth cookie management
│   ├── labels/                    # Enum → display label mapping (bridge domain ↔ UI)
│   ├── config/routes/             # Route path definitions per resource
│   ├── actions/                   # Svelte actions (confirmAction, etc.)
│   ├── utils/
│   │   └── filters.ts            # URL-driven filter engine (schema-based parse/serialize)
│   ├── layout/                    # Layout components
│   └── styles/                    # Global CSS (variables, custom classes)
│
├── routes/(backoffice)/backoffice/
│   ├── (auth)/                    # Auth routes (login, etc.)
│   └── [resource]/                # CRUD pages per resource
│       ├── +page.svelte           # List page
│       ├── +page.server.ts        # List load (filters + API)
│       ├── create/                # Create form
│       ├── [id]/edit/             # Edit form + delete action
│       ├── components/            # Route-specific components (not reusable)
│       ├── queries/               # Client-side fetch wrappers
│       └── schemas/               # Zod form + filter schemas
│
├── hooks.server.ts                # Auth middleware (token refresh, header injection)
└── messages/                      # i18n translation JSON files
```

### API Client (`src/core/`)

Always use `src/core/` request functions. **Never use raw `fetch()` or build URLs manually:**

```typescript
// In +page.server.ts (SvelteKit fetch with cookies/SSR)
import { RESOURCE_REQUEST } from '$core/resources/requests';
const result = await RESOURCE_REQUEST.findByCriteria(fetch, { query: 'term', limit: 10 });

// In client-side queries (browser's global fetch)
const item = await RESOURCE_REQUEST.findById(fetch, id);
```

The `fetch` parameter is injected — it accepts both SvelteKit's `fetch` (server) and `window.fetch` (browser). This keeps `src/core/` framework-agnostic.

- Config (retry, timeout, headers) in `src/core/_shared/config.ts`
- HTTP helpers in `src/core/_shared/helpers.ts` (get, getWithParams, post, patch, put, del)
- Error types: `network`, `timeout`, `not_found`, `unauthorized`, `forbidden`, `validation`, `server_error`, `unknown`
- All errors are instances of `ApiError` with typed `type`, `status`, `data` fields

### CQRS / Eventual Consistency

The backend uses CQRS with event sourcing. Write operations (create, update, delete) return immediately but **read projections take ~500ms to propagate**. This is critical:

- **Action factories** (`createAction`, `updateAction`, `deleteAction`) include a `redirectDelayMs` option (defaults to 500ms) that waits before redirecting so the projection is ready when the next page loads.
- **Never set `redirectDelayMs: 0`** on create/update/delete actions — the target page will fetch stale or missing data.
- **All submit buttons** must show a loading spinner and be disabled during submission (including the delay). Use `$submitting` from superforms.
- **Sub-resource operations** (e.g., addLocation, removeTag) are client-side API calls that update local state optimistically — no redirect needed, so no delay.
- **Edit forms that stay on the same page** after save need special superforms config to avoid fetching stale data:
  ```typescript
  const { form, errors, enhance, submitting } = superForm(data.form, {
  	dataType: 'json',
  	invalidateAll: false,
  	applyAction: false,
  	resetForm: false,
  	onResult({ result }) {
  		if (result.type === 'success') showToast('success');
  	}
  });
  ```

### Backend Error Codes

The API returns structured errors with `errorCode` for business rule violations (e.g., publish preconditions). These come in `err.data.errorCode` inside `ApiError`:

```typescript
if (
	err instanceof ApiError &&
	err.data &&
	typeof err.data === 'object' &&
	'errorCode' in err.data
) {
	const code = (err.data as { errorCode: string }).errorCode;
	errorMessage = getErrorMessage(code) ?? genericMessage;
}
```

Error message maps should use lazy i18n evaluation to avoid SSR fetch warnings:

```typescript
function getPublishErrorMessage(errorCode: string): string | undefined {
	const messages: Record<string, () => string> = {
		RESOURCE_NOT_PUBLISHABLE: m.resource_publishErrorNotPublishable,
		RESOURCE_MISSING_FIELD: m.resource_publishErrorMissingField
	};
	return messages[errorCode]?.();
}
```

### Forms

SvelteKit Superforms + Zod. **Always use `use:enhance`** for progressive enhancement — on ALL forms including delete. Adding a form field requires updating:

1. `src/core/[resource]/types.ts` — Add to DTO type
2. `schemas/[resource]-form.schema.ts` — Zod schema (colocated in resource's schemas/ folder)
3. `+page.server.ts` — Map API data to/from form
4. `+page.svelte` — Render with form components (`bind:value={$form.field}`, `error={$errors.field}`)

### URL-Driven Filters

URL is the single source of truth for filters, pagination, and sorting. Core utilities in `src/lib/utils/filters.ts`:

- Define a `FiltersSchema` with `parse`/`serialize`/`resetPageOnChange` per field
- Server: `parseFilters(schema, url.searchParams)` → API call
- Client: `patchFilters(schema, currentParams, patch)` → `goto()`
- Helper factories: `createPageField()`, `createSortField()`, `createBooleanField()`, etc.

### Internationalization

Paraglide JS with compiled, type-safe translations:

```typescript
import * as m from '$paraglide/messages';
// Usage: {m.resources_newResource()}
```

Translation files in `messages/{locale}/[resource].json`. The `src/paraglide/` directory is auto-generated. **Never hardcode user-facing strings** — always add i18n keys. This applies to both `.svelte` components and `+page.server.ts` files (Paraglide works in SSR). Strings passed to server-side factories (`breadcrumbLabel`, `entityName`, error messages, etc.) must also use `m.*()` translations.

### Authentication

- JWT-based auth with access token + refresh token stored in httpOnly cookies
- `hooks.server.ts` handles proactive token refresh: if the access token is expired but the refresh token is still valid, it automatically refreshes
- `handleFetch` hook injects `Authorization: Bearer` headers on API calls
- Auth cookies are scoped to `/backoffice` path

### Publish / Unpublish Pattern

Resources with lifecycle status (DRAFT → PUBLISHED → UNPUBLISHED) use dedicated endpoints instead of PATCH status:

- `POST /resources/:id/publish` — validates preconditions, returns `errorCode` on failure
- `POST /resources/:id/unpublish`
- The frontend sends `action: 'publish' | 'unpublish'` via form hidden input, not the status value directly
- Backend error codes are mapped to user-friendly i18n messages

### Create-and-Return Pattern

When editing a parent resource and needing to create a child resource inline:

1. **Parent page** generates a link: `/backoffice/child/create?returnTo={encodedCurrentUrl}`
2. **Child create action** checks for `returnTo` param after successful creation, redirects back with `?addChildId={newId}`
3. **Parent page load** detects `addChildId`, fetches the new resource
4. **Parent page client** auto-adds it via `$effect` and cleans the URL param

The `createCreateAction` factory supports this with the `returnToParam` option.

## Code Conventions

### Svelte 5 Runes Only

- `$state()`, `$props()`, `$derived()`, `$effect()` — no legacy `export let` or `$:` syntax
- `$bindable()` for two-way binding props
- No legacy `on:click` events — use `onclick` (Svelte 5 standard)
- No `createEventDispatcher` — use callback props instead
- No `<slot>` — use snippets (`{#snippet}` / `{@render}`)
- No writable stores unless global state is strictly required

### Svelte 5 Patterns & Anti-Patterns

**Page props — use `PageProps` / `LayoutProps` from generated types:**

```svelte
<!-- CORRECT -->
import type { PageProps } from './$types';
let { data }: PageProps = $props();

<!-- WRONG — redundant manual typing -->
import type { PageData } from './$types';
let { data }: { data: PageData } = $props();
```

**Component props — pass values directly, avoid wrapper objects:**

```svelte
<!-- CORRECT -->
<ResourceForm form={data.form} mode="edit" />

<!-- WRONG — unnecessary indirection -->
<ResourceForm data={{ form: data.form }} mode="edit" />
```

**`$derived` for computed values, `$effect` only for side effects:**

```svelte
<!-- CORRECT -->
let doubled = $derived(count * 2);

<!-- WRONG — don't use $effect to set derived values -->
let doubled = $state(0);
$effect(() => { doubled = count * 2; });
```

**`$state` + `$effect` for local state synced from external source (e.g. URL filters):**

```svelte
let searchQuery = $state(filters.q || '');
$effect(() => { searchQuery = filters.q || ''; });
```

**`use:enhance` on every form — including delete forms:**

```svelte
<!-- Without enhance: full page navigation (slow, visible reload) -->
<!-- With enhance: fetch in background + redirect (fast, no flash) -->
<form method="POST" action="?/delete" use:enhance>
```

**Explicit template rendering over fake-generic iterations:**

```svelte
<!-- CORRECT — when each column has custom rendering -->
<td>{item.name}</td>
<td>{KIND_OPTIONS.find((k) => k.id === item.kind)?.name}</td>

<!-- WRONG — iterating columns only to branch on key defeats the purpose -->
{#each columns as col}
	{#if col.key === 'name'}
		...
	{:else if col.key === 'kind'}
		...
	{/if}
{/each}
```

**Callback props for component events (not createEventDispatcher):**

```svelte
<!-- Component -->
<script lang="ts">
	let { onconfirm, oncancel }: Props = $props();
</script>

<button onclick={() => onconfirm?.()}>OK</button>

<!-- Parent -->
<Dialog onconfirm={() => save()} oncancel={() => reset()} />
```

**Snippets for composition (not slots):**

```svelte
<!-- Component -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	let { header, children }: { header?: Snippet; children: Snippet } = $props();
</script>

{@render header?.()}
{@render children()}

<!-- Parent -->
<Card>
	{#snippet header()}<h1>Title</h1>{/snippet}
	<p>Body content</p>
</Card>
```

### Styling

- Tailwind CSS v4 everywhere, no inline styles, no CSS modules, no CSS-in-JS
- DaisyUI for backoffice components
- Scoped `<style>` blocks for component-specific CSS
- Always use nested CSS when possible

### TypeScript

- Strict mode, prefer `type` over `interface`
- Use `import type { ... }` for type-only imports
- Zod schemas are the source of truth for form types

### Comments

- JSDoc-style comments in English on modules, components, and non-obvious functions
- No inline comments unless the logic is genuinely non-obvious

### Formatting

- Tabs for indentation, single quotes, no trailing commas, 100 char print width
- Prettier with `prettier-plugin-svelte` and `prettier-plugin-tailwindcss`

### File Naming

- Components: `PascalCase.svelte`
- Routes: kebab-case directories
- Schemas: `schemas/[name]-form.schema.ts`, `schemas/filters.schema.ts` (in resource folder)
- Client-side queries: `queries/[name].queries.ts` (in resource route folder)
- Utils: `camelCase.ts`

### Prices

All prices in the API/database are stored in **cents** (integers). The UI must convert between euros and cents:

- Display: `cents / 100` → show with 2 decimals
- Submit: `euros * 100` → send integer to API

## Workflow Reference

### Adding a New API Resource

1. Create `src/core/[resource]/types.ts` — Projections, DTOs, Criteria types
2. Create `src/core/[resource]/enums.ts` — Resource enums (mirror backend exactly)
3. Create `src/core/[resource]/requests.ts` — CRUD + criteria request functions
4. All request functions receive `fetchFn: typeof fetch` as first parameter

### Creating a CRUD Section

```
backoffice/[resource]/
├── +page.svelte                  ← List page
├── +page.server.ts               ← List load (filters + API)
├── create/
│   ├── +page.svelte              ← Create form
│   └── +page.server.ts           ← Load + action
├── [id]/edit/
│   ├── +page.svelte              ← Edit form
│   └── +page.server.ts           ← Load + update/delete actions
├── components/
│   ├── ResourceForm.svelte       ← Shared form (create + edit)
│   └── ResourceFormActions.svelte ← Action bar (back, status, delete, save)
├── queries/
│   └── resource-search.queries.ts ← Client-side async search
└── schemas/
    ├── resource-form.schema.ts   ← Zod form schema
    └── filters.schema.ts         ← URL filter schema
```

### Checklist for a New CRUD

- [ ] Types, DTOs, Criteria in `src/core/[resource]/types.ts`
- [ ] Enums in `src/core/[resource]/enums.ts`
- [ ] Request functions in `src/core/[resource]/requests.ts`
- [ ] Zod schema in `schemas/[resource]-form.schema.ts`
- [ ] Filter schema in `schemas/filters.schema.ts`
- [ ] i18n keys in `messages/{locale}/[resource].json`
- [ ] Route definitions in `src/lib/config/routes/backoffice/[resource].ts`
- [ ] Labels file in `src/lib/labels/[resource].ts`
- [ ] Route files: `+page`, `create/`, `[id]/edit/`
- [ ] `ResourceForm.svelte` + `ResourceFormActions.svelte`
- [ ] Queries in `queries/` if async search is needed
- [ ] `use:enhance` on ALL forms (create, update, delete)
- [ ] `PageProps` for page prop typing (not `{ data: PageData }`)
- [ ] Submit buttons disabled + spinner during submission
- [ ] CQRS delay on all redirects after mutations

### Creating Components

- Study similar components in `src/lib/components/backoffice/`
- Use `$props()` with a `type Props = { ... }` definition for props
- Use `$bindable()` for two-way binding
- Melt UI for headless components (Calendar, ComboBox, Drawer, etc.)
- Components are presentation-focused — no fetch calls inside (except sub-resource operations in `queries/` files)

### Client-Side Queries (e.g. async search)

When a component needs to fetch data directly from the browser, create a query file in the route's `queries/` folder:

```typescript
// queries/resource-search.queries.ts
import { RESOURCE_REQUEST } from '$core/resources/requests';

export async function searchResources(query: string): Promise<SearchResult[]> {
	try {
		const result = await RESOURCE_REQUEST.findByCriteria(fetch, { query, limit: 10 });
		return result.data.map((item) => ({ value: item.id, label: item.name }));
	} catch {
		return [];
	}
}
```

Never use raw `fetch()` with manual URL construction. Always go through `$core` for retry, timeout, auth headers, and error typing.

## Layer Boundaries — What Goes Where

| Concern                       | Correct location                    | NOT here                 |
| ----------------------------- | ----------------------------------- | ------------------------ |
| API types (Projections, DTOs) | `src/core/[resource]/types.ts`      | Components, routes       |
| Enums (domain values)         | `src/core/[resource]/enums.ts`      | Labels, components       |
| API calls                     | `src/core/[resource]/requests.ts`   | Components, pages        |
| Enum → display label          | `src/lib/labels/[resource].ts`      | Domain types, components |
| Form validation               | `schemas/[resource]-form.schema.ts` | Domain types             |
| Server orchestration          | `src/lib/server/backoffice/`        | Components               |
| URL filter parsing            | `src/lib/utils/filters.ts`          | Server actions           |
| Reusable UI                   | `src/lib/components/backoffice/`    | Routes                   |
| Route-specific UI             | `src/routes/.../components/`        | `src/lib/components/`    |
| Client-side fetching          | `src/routes/.../queries/`           | Components inline        |

### Common Violations to Avoid

1. **Domain leaking UI concerns** — no `statusColor`, `icon`, `label` in `src/core/` types
2. **Components calling API directly** — use load functions, actions, or `queries/` files
3. **Routes importing from other routes** — if shared, move to `src/lib/components/`
4. **Form schemas with projection-only fields** — only fields from CreateDto/UpdateDto
5. **Domain types redefined in components** — import from `src/core/`
6. **Complex business logic in templates** — extract to `$derived` or helper functions
