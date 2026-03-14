# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SvelteKit application serving two domains from a single codebase: **Backoffice** (admin CRUD panel) and **Marketplace** (public-facing). Both consume an external REST API.

## Commands

```bash
npm run dev              # Dev server (http://localhost:5173)
npm run build            # Production build
npm run preview          # Preview production build
npm run check            # Type-check (svelte-kit sync + svelte-check)
npm run check:watch      # Type-check in watch mode
npm run lint             # Prettier check + ESLint
npm run format           # Auto-format with Prettier
npm run storybook        # Component dev (port 6006, marketplace config)
```

## Architecture

### Dual-Domain Structure

Routes use SvelteKit route groups to separate domains:

- `src/routes/(backoffice)/backoffice/` — Admin pages (DaisyUI styling)
- `src/routes/(marketplace)/` — Public pages
- `src/routes/(marketplace-checkout)/` — Checkout flow
- `src/routes/(backoffice)/backoffice/(auth)/` — Auth routes (nested group)

### Key Directories

- `src/core/` — **Domain layer**: API requests, types, enums per resource (framework-agnostic)
  - `_shared/` — HTTP client, config, helpers, error classes, shared types
  - `[resource]/requests.ts` — API request functions (CRUD + criteria queries)
  - `[resource]/types.ts` — Projections, DTOs, and criteria types
  - `[resource]/enums.ts` — Resource-specific enums
- `src/lib/components/backoffice/forms/` — Form components (FormInputText, FormSelect, etc.)
- `src/lib/components/backoffice/` — Backoffice UI (tables, pagination, filters, dialogs)
- `src/lib/components/marketplace/` — Marketplace UI components
- `src/lib/server/backoffice/` — Server-side action factories (createAction, updateAction, deleteAction, flashMessages)
- `src/lib/utils/filters.ts` — URL-driven filter engine (schema-based parse/serialize)
- `src/lib/config/` — Route definitions, enums, component config
- `src/lib/actions/` — Svelte actions (confirmAction, checkAll, photoswipeGallery)
- `src/lib/layout/` — Layout components per domain
- `src/lib/styles/` — Global custom CSS (variables, custom classes)
- `messages/` — i18n translation JSON files

### API Client (`src/core/`)

Always use `src/core/` request functions. Never use raw `fetch()` or build URLs manually:

```typescript
// In +page.server.ts (SvelteKit fetch with cookies/SSR)
import { LOCATION_REQUEST } from '$core/locations/requests';
const result = await LOCATION_REQUEST.findByCriteria(fetch, { query: 'madrid', limit: 10 });

// In client-side queries (browser's global fetch — also works)
const loc = await LOCATION_REQUEST.findById(fetch, id);
```

The `fetch` parameter is injected — it accepts both SvelteKit's `fetch` (server) and `window.fetch` (browser). This keeps `src/core/` framework-agnostic.

- Config (retry, timeout, headers) in `src/core/_shared/config.ts`
- HTTP helpers in `src/core/_shared/helpers.ts` (get, getWithParams, post, patch, put, del)
- Error types: `network`, `timeout`, `not_found`, `unauthorized`, `forbidden`, `validation`, `server_error`, `unknown`

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
// Usage: {m.activities_newActivity()}
```

Translation files in `messages/{locale}.json`. The `src/paraglide/` directory is auto-generated. **Never hardcode user-facing strings** — always add i18n keys. This applies to both `.svelte` components and `+page.server.ts` files (Paraglide works in SSR). Strings passed to server-side factories (`breadcrumbLabel`, `entityName`, error messages, etc.) must also use `m.*()` translations.

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
<LocationForm form={data.form} mode="edit" />

<!-- WRONG — unnecessary indirection -->
<LocationForm data={{ form: data.form }} mode="edit" />
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
- Zod schemas are the source of truth for form types (not Valibot — it's installed but unused)

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

## Workflow Reference

### Adding a New API Resource

1. Create `src/core/[resource]/types.ts` — Projections, DTOs, Criteria types
2. Create `src/core/[resource]/enums.ts` — Resource enums
3. Create `src/core/[resource]/requests.ts` — CRUD + criteria request functions
4. All request functions receive `fetchFn: typeof fetch` as first parameter

### Creating Components

- Study similar components in `src/lib/components/backoffice/` or `marketplace/`
- Use `$props()` with a `type Props = { ... }` definition for props
- Use `$bindable()` for two-way binding
- Melt UI for headless components (Calendar, ComboBox, Drawer, etc.)
- Icons from `@solar-icons/svelte`

### Client-Side Queries (e.g. async search)

When a component needs to fetch data directly from the browser (not through a load function), create a query file in the route's `queries/` folder that wraps `$core` requests:

```typescript
// queries/location-search.queries.ts
import { LOCATION_REQUEST } from '$core/locations/requests';

export async function searchLocations(query: string): Promise<SearchResult[]> {
	try {
		const result = await LOCATION_REQUEST.findByCriteria(fetch, { query, limit: 10 });
		return result.data.map((loc) => ({ value: loc.id, label: loc.name }));
	} catch {
		return [];
	}
}
```

Never use raw `fetch()` with manual URL construction in query files. Always go through `$core` to get retry, timeout, auth headers, and error typing.

## Additional Documentation

- `docs/api.md` — API client system guide
- `docs/backoffice-crud-guide.md` — Step-by-step CRUD section guide
- `docs/i18n-paraglide.md` — i18n setup
