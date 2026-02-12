# AI Project Context

This project is a SvelteKit application for a REST API frontend with two domains: **backoffice** (admin panel) and **marketplace** (public-facing).

## Framework

- **SvelteKit v5** (runes enabled, experimental `remoteFunctions` and `async` compiler)
- **TypeScript** (strict mode)
- **Vite** as build tool

## Styling

- **Tailwind CSS v4** is used everywhere
- **DaisyUI** for backoffice UI components
- **@tailwindcss/forms** for form styling
- **@tailwindcss/typography** for content styling
- **No CSS modules**
- **No styled-components**
- **No inline styles** (use Tailwind classes)

## State & Logic

- **Always use Svelte 5 runes**: `$state`, `$props`, `$derived`, `$effect`
- **Avoid writable stores** unless global state is required
- **No legacy reactive declarations** (`$:`) - use `$derived` instead
- **No legacy props** (`export let`) - use `$props()` instead

## Routing & Data

- **Use `+page.server.ts`** for data fetching and server-side logic
- **REST API backend** (external)
- **API Client**: Use `import { api, ApiError } from '$lib/api/index'` for all API calls
- **Never use `fetch()` directly** - always use the centralized API client
- **Pagination, filters and sorting** are server-driven via URL params
- **Route groups**: `(backoffice)` for admin pages, `(marketplace)` for public pages, `(marketplace-checkout)` for checkout flow. `(auth)` is nested inside `(backoffice)`
- **Dynamic routes**: Use `[slug]` for dynamic parameters

## API Client

- **Centralized in** `src/lib/api/`
- **Always import from** `$lib/api/index`
- **Usage**: `await api.activities.getAll(fetch, { page: 1 })`
- **Error handling**: Wrap in try-catch and check for `ApiError` instance
- **Dual API**: Separate clients for backoffice (`$lib/api/backoffice`) and marketplace (`$lib/api/marketplace`). Default export (`$lib/api/index`) re-exports backoffice for backwards compatibility.
- **Configuration**:
  - Routes: `src/lib/api/shared/endpoints.config.ts`
  - Behavior: `src/lib/api/shared/config.ts`
- **Features**: Retry logic, timeout, error handling tipado, logging
- **Never use** `PUBLIC_API_BASE_URL` directly - let the client handle it

## Forms & Validation

- **SvelteKit Superforms** for form handling
- **Zod** for schema validation (valibot is installed but NOT used — use Zod)
- **Progressive enhancement** with `use:enhance`
- **Server-side validation** in `+page.server.ts`
- Form schemas in separate `.schema.ts` files colocated with their routes

## UI Components & Libraries

- **Melt UI**: Headless components (Calendar, ComboBox, etc.)
- **Svelte Iconoir**: Icon library
- **PhotoSwipe**: Image galleries
- **Swiper**: Carousels and sliders
- **@internationalized/date**: Date handling
- **bytemd**: Markdown editor (used in `FormTextareaMarkdown`)
- **theme-change**: Theme switching support
- **Storybook v10**: Component development (config: `.storybook-marketplace`)

## Internationalization (i18n)

- **Paraglide JS**: Type-safe i18n with compiled translations
- Translations in `/messages/{locale}.json`
- Import: `import * as m from '$paraglide/messages'`
- Usage: `{m.activities_newActivity()}`
- See `/docs/i18n-paraglide.md` for full documentation

## UI Conventions

- **Tables**: Basic HTML `<table>` + Tailwind (no heavy table libraries)
- **Confirm dialogs**: Custom `confirmAction` Svelte action + `AlertDialog` component
- **Pagination**: Custom component with server-side logic
- **Alerts**: `LayoutAlertBox` component for notifications

## Custom Utilities

- **`confirmAction`**: Svelte action for confirmation dialogs (use with `use:confirmAction`)
- **`buildUrlWithFilters`**: Helper to preserve URL params during navigation

## Code Style

- **No comments** unless explicitly requested
- **Prefer TypeScript types** over interfaces when possible
- **Use `type` imports** when importing only types
- **Consistent naming**: camelCase for variables/functions, PascalCase for components

## What NOT to use

- ❌ No React patterns (hooks, JSX, etc.)
- ❌ No Redux or Vuex
- ❌ No Vue-specific concepts
- ❌ No Svelte 4 legacy syntax (`export let`, `$:`, etc.)
- ❌ No Valibot (installed as dependency but NOT used — always use Zod)
- ❌ No heavy UI libraries (Material UI, Ant Design, etc.)
- ❌ No CSS-in-JS libraries

---

## Skills Available

This project includes interactive skills for common tasks. Skills are located in `.github/copilot/skills/`.

### Available Skills

1. **`add-form-field`** - Añadir campos a formularios existentes
   - Actualiza types, schemas Zod, data handlers y UI
   - Mantiene consistencia en toda la app

2. **`add-api-endpoint`** - Añadir endpoints a la API
   - Sigue estructura post-refactor con `.path()`
   - Aparece automáticamente en `/api-catalog`

3. **`create-component`** - Crear componentes reutilizables
   - Extrae código repetitivo
   - Sigue patrones Svelte 5 con runes

### Using Skills

```bash
# Modo interactivo (recomendado)
add-form-field

# Con argumentos
add-form-field booking-form guestCount number
```

---

## Common Workflows

### Adding a New Field to a Form

**Files to modify:**

1. `src/lib/types.ts` - Add property to type
2. `src/routes/(backoffice)/backoffice/[resource]/[resource]-form.schema.ts` - Add Zod validation
3. `src/routes/(backoffice)/backoffice/[resource]/[slug]/edit/+page.server.ts` - Update data handler
4. `src/routes/(backoffice)/backoffice/[resource]/[slug]/edit/+page.svelte` - Add UI component

**Pro tip:** Use the `add-form-field` skill for step-by-step guidance.

---

### Adding a New API Endpoint

**Files to modify:**

1. `src/lib/api/shared/endpoints.config.ts` - Add endpoint configuration
2. `src/lib/api/backoffice/endpoints/[resource].ts` or `src/lib/api/marketplace/endpoints/[resource].ts` - Implement method
3. `src/lib/api/backoffice/index.ts` or `src/lib/api/marketplace/index.ts` - Export (if new resource)

**Pro tip:** Use the `add-api-endpoint` skill for detailed workflow.

---

### Creating a Reusable Component

**Steps:**

1. Analyze similar components in `src/lib/components/backoffice/` or `src/lib/components/marketplace/`
2. Use Svelte 5 runes (`$props()`, `$state()`, `$derived()`)
3. Add example to `/components` page

**Pro tip:** Use the `create-component` skill for templates and patterns.

---

## Quick Reference

### API Client Pattern (Post-Refactor)

```typescript
// ✅ Correct
const path = API_ENDPOINTS.activities.list.path();
const data = await api.activities.getAll(fetch);

// ❌ Incorrect (pre-refactor)
const path = API_ENDPOINTS.activities.list();
```

### Form Component Pattern

```svelte
<FormInputText
	id="fieldName"
	label="Label"
	bind:value={$form.fieldName}
	error={$errors.fieldName}
/>
```

### Svelte 5 Runes

```svelte
<script lang="ts">
	// Props
	let { value, onUpdate }: Props = $props();

	// State
	let count = $state(0);

	// Derived
	const doubled = $derived(count * 2);

	// Effect
	$effect(() => {
		console.log('Count changed:', count);
	});
</script>
```

### Error Handling

```typescript
try {
	const data = await api.resource.action(fetch);
	return { data };
} catch (err) {
	if (err instanceof ApiError) {
		throw error(err.status || 500, err.message);
	}
	throw error(500, 'Error inesperado');
}
```

---

## Decision Trees

### Need to fetch data from API?

```
→ Use API client from `$lib/api/index`
→ Call in `+page.server.ts` (server-side)
→ Handle errors with `ApiError`
→ NEVER use fetch() directly
```

### Need user input?

```
→ Use Superforms + Zod schema
→ Components from `$lib/components/backoffice/forms/`
→ Server-side validation in actions
→ Handle errors with `fail()`
```

### Need confirmation dialog?

```
→ Use `use:confirmAction` Svelte action
→ NOT browser's alert() or confirm()
→ Styled with DaisyUI AlertDialog
```

### Need to show data in a table?

```
→ Use basic HTML <table> with Tailwind
→ NOT heavy table libraries
→ Server-side pagination and sorting
```

---

## File Organization Rules

```
src/
├── lib/
│   ├── types.ts                          ← All TypeScript types
│   ├── api/                              ← API client and endpoints
│   │   ├── shared/
│   │   │   ├── endpoints.config.ts       ← Endpoint definitions (source of truth)
│   │   │   ├── config.ts                 ← API behavior config (retry, timeout, headers)
│   │   │   ├── client.ts                 ← HTTP client
│   │   │   ├── errors.ts                 ← ApiError class
│   │   │   └── types.ts                  ← API types
│   │   ├── backoffice/
│   │   │   ├── endpoints/                ← Backoffice endpoint implementations
│   │   │   └── index.ts                  ← Backoffice API exports
│   │   ├── marketplace/
│   │   │   ├── endpoints/                ← Marketplace endpoint implementations
│   │   │   └── index.ts                  ← Marketplace API exports
│   │   └── index.ts                      ← Re-exports backoffice (backwards compat)
│   ├── components/
│   │   ├── backoffice/
│   │   │   ├── forms/                    ← Backoffice form components
│   │   │   └── *.svelte                  ← Backoffice UI components
│   │   └── marketplace/                  ← Marketplace UI components
│   ├── actions/                          ← Svelte actions
│   │   ├── backoffice/
│   │   └── marketplace/
│   └── utils/                            ← Utility functions
└── routes/
    ├── (backoffice)/backoffice/          ← Admin pages
    │   ├── (auth)/                       ← Login/register (nested)
    │   └── [resource]/
    │       ├── +page.svelte
    │       ├── +page.server.ts
    │       ├── [resource]-form.schema.ts ← Zod schema (colocated)
    │       └── [slug]/edit/
    │           ├── +page.svelte
    │           └── +page.server.ts
    ├── (marketplace)/                    ← Public-facing pages
    └── (marketplace-checkout)/           ← Checkout flow
```

---

## Code Examples

### Complete CRUD Page Load

```typescript
// +page.server.ts
import { api, ApiError } from '$lib/api/index';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url }) => {
	try {
		const response = await api.activities.getAll(fetch, {
			page: Number(url.searchParams.get('page')) || 1,
			pageSize: 20
		});

		return {
			activities: response.data,
			pagination: response.pagination
		};
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status || 500, err.message);
		}
		throw error(500, 'Error inesperado');
	}
};
```

### Complete Form with Validation

```typescript
// +page.server.ts
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { activityEditSchema } from '../activity-form.schema';

export const actions: Actions = {
	default: async ({ request, params, fetch }) => {
		const form = await superValidate(request, zod(activityEditSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await api.activities.update(fetch, params.slug, form.data);
			return { form };
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status || 500, {
					form,
					error: err.message
				});
			}
			return fail(500, { form, error: 'Error al actualizar' });
		}
	}
};
```

---

## Tips for LLM Agents

### When generating code:

- Always check existing similar files first
- Follow established patterns in the codebase
- Use Svelte 5 runes, not legacy syntax
- Use TypeScript for type safety
- Use Tailwind for all styling

### When modifying forms:

- Update ALL related files (types, schema, server, UI)
- Use form components from `$lib/components/backoffice/forms/`
- Always bind to `$form.*` and `$errors.*`

### When working with API:

- Use `.path()` to get URLs (post-refactor structure)
- Always handle `ApiError` in catch blocks
- Add config in `src/lib/api/shared/endpoints.config.ts`
- Verify endpoint appears in `/api-catalog`

### When creating components:

- Study similar components first in `src/lib/components/backoffice/` or `src/lib/components/marketplace/`
- Use `$props()` for props, not `export let`
- Use `$bindable()` for two-way binding
- Add visual example to `/components` page

---

## Resources

- **Skills documentation:** `.github/copilot/skills/`
- **API documentation:** `docs/api.md`
- **Examples page:** `/components` (in browser)
- **API catalog:** `/api-catalog` (in browser)
