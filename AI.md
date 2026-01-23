# AI Project Context

This project is a SvelteKit application for a REST API frontend.

## Framework

- **SvelteKit v5** (runes enabled)
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
- **Route groups**: `(app)` for authenticated pages, `(auth)` for login/register
- **Dynamic routes**: Use `[slug]` for dynamic parameters

## API Client

- **Centralized in** `src/lib/api/`
- **Always import from** `$lib/api/index`
- **Usage**: `await api.activities.getAll(fetch, { page: 1 })`
- **Error handling**: Wrap in try-catch and check for `ApiError` instance
- **Configuration**:
  - Routes: `src/lib/api/endpoints.config.ts`
  - Behavior: `src/lib/api/config.ts`
- **Features**: Retry logic, timeout, error handling tipado, logging
- **Never use** `PUBLIC_API_BASE_URL` directly - let the client handle it

## Forms & Validation

- **SvelteKit Superforms** for form handling
- **Zod** for schema validation (not Valibot)
- **Progressive enhancement** with `use:enhance`
- **Server-side validation** in `+page.server.ts`
- Form schemas in separate `.schema.ts` files

## UI Components & Libraries

- **Melt UI**: Headless components (Calendar, ComboBox, etc.)
- **Svelte Iconoir**: Icon library
- **PhotoSwipe**: Image galleries
- **Swiper**: Carousels and sliders
- **@internationalized/date**: Date handling

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
- ❌ No Valibot (use Zod instead)
- ❌ No heavy UI libraries (Material UI, Ant Design, etc.)
- ❌ No CSS-in-JS libraries
