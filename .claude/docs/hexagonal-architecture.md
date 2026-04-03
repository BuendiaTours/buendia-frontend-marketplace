# Hexagonal Architecture — Frontend Review Guide

This document defines how hexagonal architecture (ports & adapters) applies to this SvelteKit codebase. Use it to **review, judge, and refactor** existing code — not just new code.

## Layers

```
src/core/          → DOMAIN (innermost — zero framework imports)
src/lib/server/    → APPLICATION SERVICES (orchestrate domain, framework-aware)
src/lib/components → UI ADAPTERS (render state, dispatch user intent)
src/lib/utils/     → INFRASTRUCTURE HELPERS (URL, i18n, formatting)
src/routes/        → DRIVING ADAPTERS (SvelteKit entry points — load, actions, pages)
```

## The Golden Rule

**Dependencies point inward.** `src/core/` never imports from `src/lib/`, `src/routes/`, or `$app/*`. Everything else may import from `src/core/`.

## Layer Responsibilities

### 1. Domain — `src/core/[resource]/`

**What belongs here:**

- Types: Projections (read models), DTOs (write models), Criteria (query params)
- Enums: domain values that mirror the backend contract
- Requests: functions that call the API — receive `fetchFn: typeof fetch` as first param

**What does NOT belong here:**

- Svelte imports (`$app/*`, `svelte/*`, `sveltekit-superforms`)
- UI labels, i18n keys, option arrays
- Form schemas (Zod) — these belong in route `schemas/` folders
- Business logic that depends on the UI framework

**Review checklist:**

- [ ] No `import` from `$lib/`, `$app/`, `svelte`, or any UI library
- [ ] Types reflect the API contract, not UI needs (no `label`, `color`, `icon` fields)
- [ ] Enums are string unions or TS enums — no display logic
- [ ] Request functions are pure data in → Promise data out
- [ ] `_shared/` only contains HTTP plumbing, no domain logic

### 2. Application Services — `src/lib/server/backoffice/`

**What belongs here:**

- Server-side action factories (`createAction`, `updateAction`, `deleteAction`)
- Flash message helpers
- Orchestration that combines multiple domain calls

**What does NOT belong here:**

- Direct HTML rendering or Svelte components
- Domain types (those live in `src/core/`)

**Review checklist:**

- [ ] Factories are generic — parameterized by schema, request fn, and transform
- [ ] No resource-specific logic hardcoded (it should be passed as config)
- [ ] `transformData` conversions are defined at the call site (route), not here

### 3. UI Adapters — `src/lib/components/`

**What belongs here:**

- Reusable Svelte components (forms, tables, filters, layout)
- Components receive data via props, emit intent via callbacks
- No direct API calls — data comes from load functions or parent components

**What does NOT belong here:**

- API calls (use `src/core/` request functions in load/actions or query files)
- Route-specific business logic
- Domain types redefined locally

**Review checklist:**

- [ ] Components are presentation-focused — no fetch calls inside
- [ ] Props use domain types from `src/core/`, not local redefinitions
- [ ] Side effects (API calls) are in load functions, actions, or `queries/` files
- [ ] Components don't import from `src/routes/`

### 4. Driving Adapters — `src/routes/`

**What belongs here:**

- `+page.server.ts` — load functions (read), form actions (write)
- `+page.svelte` — page composition, wiring components to data
- `schemas/` — Zod form schemas (bridge between domain DTOs and UI forms)
- `queries/` — client-side data fetching wrappers
- `components/` — route-specific components (not reusable)

**Review checklist:**

- [ ] Load functions call `src/core/` requests, never raw `fetch()`
- [ ] Form actions use server-side factories or call `src/core/` requests
- [ ] `transformData` in actions converts UI shape → API DTO shape
- [ ] Schemas only validate fields from CreateDto/UpdateDto — no projection-only fields
- [ ] Pages don't contain business logic — they wire data to components

## Labels & Options: The Translation Layer

`src/lib/labels/[resource].ts` is the bridge between domain enums and UI display:

```typescript
// CORRECT — labels file translates enum → display
export const STATUS_OPTIONS = [{ id: Status.ACTIVE, name: m.enum_status_active() }];

// WRONG — adding display info to domain types
export type Activity = { status: Status; statusLabel: string; statusColor: string };
```

**Review checklist:**

- [ ] Labels files only import from `$core/` (enums) and `$paraglide/messages`
- [ ] No business logic in labels — just enum-to-display mapping
- [ ] Options arrays are flat `{ id, name }` — no color/icon/component refs

## Common Violations to Flag

### 1. Domain leaking UI concerns

```typescript
// BAD — src/core/activities/types.ts
export type Activity = { status: Status; statusColor: string };
//                                       ^^^^^^^^^^^ UI concern
```

### 2. UI components calling the API directly

```svelte
<!-- BAD — component makes its own fetch -->
<script>
	import { ACTIVITY_REQUEST } from '$core/activities/requests';
	let data = $state([]);
	$effect(() => {
		ACTIVITY_REQUEST.findAll(fetch).then((r) => (data = r));
	});
</script>
```

Exception: sub-resource operations (add/remove relations) that update local state optimistically are acceptable as client-side calls, but should be in `queries/` files, not inline.

### 3. Route importing from another route

```typescript
// BAD — routes should not cross-import
import { something } from '../../other-resource/components/Thing.svelte';
```

If a component is shared, move it to `src/lib/components/`.

### 4. Form schemas containing projection-only fields

```typescript
// BAD — createdAt is read-only, should not be in the form schema
export const schema = z.object({
	name: z.string(),
	createdAt: z.string() // not in CreateDto/UpdateDto
});
```

### 5. Domain types redefined in components

```typescript
// BAD — duplicating types instead of importing from core
type Activity = { id: string; name: string; status: string };
// GOOD
import type { Activity } from '$core/activities/types';
```

### 6. Business logic in page templates

```svelte
<!-- BAD — complex logic in template -->
{#if item.status === 'PUBLISHED' && item.options.some(o => o.tickets.length > 0 && o.bookingSystem !== 'NONE')}

<!-- GOOD — extract to a derived or helper -->
const isBookable = $derived(checkBookable(item));
```

## When Reviewing Existing Code

Ask these questions in order:

1. **Dependency direction**: Does this file import from a layer it shouldn't?
2. **Single responsibility**: Does this file mix concerns from different layers?
3. **Domain purity**: Are UI concepts leaking into `src/core/`?
4. **Proper placement**: Would this code be more natural in a different layer?
5. **Framework coupling**: Could this logic survive a framework migration?

Score: if `src/core/` could be copy-pasted into a React or vanilla JS project with zero changes, the architecture is healthy.
