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

- `src/lib/api/` — Centralized API client with retry, timeout, typed errors
  - `shared/` — HTTP client, config, endpoint definitions, error classes
  - `backoffice/endpoints/` — Backoffice API modules
  - `marketplace/endpoints/` — Marketplace API modules
  - `index.ts` — Re-exports backoffice (backwards compat)
- `src/lib/components/backoffice/forms/` — Form components (FormInputText, FormSelect, etc.)
- `src/lib/components/backoffice/` — Backoffice UI (tables, pagination, filters, dialogs)
- `src/lib/components/marketplace/` — Marketplace UI components
- `src/lib/server/backoffice/` — Server-side action factories (createAction, updateAction, deleteAction, flashMessages)
- `src/lib/utils/filters.ts` — URL-driven filter engine (schema-based parse/serialize)
- `src/lib/config/` — Route definitions, enums, component config
- `src/lib/types.ts` — All shared TypeScript types
- `src/lib/actions/` — Svelte actions (confirmAction, checkAll, photoswipeGallery)
- `src/lib/layout/` — Layout components per domain
- `src/lib/styles/` — Global custom CSS (variables, custom classes)
- `messages/` — i18n translation JSON files

### API Client

Always use the centralized client, never raw `fetch()`:

```typescript
import { api, ApiError } from '$lib/api/index';
const data = await api.activities.getAll(fetch, { page: 1 });
```

- Endpoint routes defined in `src/lib/api/shared/endpoints.config.ts` (use `.path()` to get URLs)
- Config (retry, timeout, headers) in `src/lib/api/shared/config.ts`
- Error types: `network`, `timeout`, `not_found`, `unauthorized`, `forbidden`, `validation`, `server_error`, `unknown`

### Forms

SvelteKit Superforms + Zod. Adding a form field requires updating:

1. `src/lib/types.ts` — Add to type definition
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

Translation files in `messages/{locale}.json`. The `src/paraglide/` directory is auto-generated.

## Code Conventions

### Svelte 5 Runes Only

- `$state()`, `$props()`, `$derived()`, `$effect()` — no legacy `export let` or `$:` syntax
- `$bindable()` for two-way binding props
- No legacy `on:...` events, use Svelte 5 event standards
- No writable stores unless global state is strictly required

### Styling

- Tailwind CSS v4 everywhere, no inline styles, no CSS modules, no CSS-in-JS
- DaisyUI for backoffice components
- Scoped `<style>` blocks for component-specific CSS

### TypeScript

- Strict mode, prefer `type` over `interface`
- Use `import type { ... }` for type-only imports
- Zod schemas are the source of truth for form types (not Valibot — it's installed but unused)

### Formatting

- Tabs for indentation, single quotes, no trailing commas, 100 char print width
- Prettier with `prettier-plugin-svelte` and `prettier-plugin-tailwindcss`

### File Naming

- Components: `PascalCase.svelte`
- Routes: kebab-case directories
- Schemas: `schemas/[name]-form.schema.ts`, `schemas/filters.schema.ts` (in resource folder)
- Utils: `camelCase.ts`

## Workflow Reference

### Adding a New API Endpoint

1. Define route in `src/lib/api/shared/endpoints.config.ts`
2. Implement in `src/lib/api/backoffice/endpoints/[resource].ts` or `marketplace/endpoints/`
3. Export from domain `index.ts` if new resource

### Creating Components

- Study similar components in `src/lib/components/backoffice/` or `marketplace/`
- Use `$props()` for props, `$bindable()` for two-way binding
- Melt UI for headless components (Calendar, ComboBox, Drawer, etc.)
- Icons from `@solar-icons/svelte`

## Additional Documentation

- `AI.md` — Extended AI context with patterns, decision trees, and code examples
- `docs/api.md` — API client system guide
- `docs/architecture-server-factories.md` — Server factory pattern
- `docs/form-validation-flow.md` — Form handling details
- `docs/i18n-paraglide.md` — i18n setup
