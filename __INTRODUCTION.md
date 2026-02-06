## PARTE 1: CONCEPTOS FUNDAMENTALES (30 min)

### 1.1 Del DOM imperativo al desarrollo reactivo (10 min)

- **jQuery (imperativo):** Manipulación directa del DOM
  - Seleccionar elementos (`$('.class')`)
  - Modificar manualmente (`$.html()`, `.addClass()`)
  - Event listeners explícitos

- **Svelte (reactivo):** UI como función del estado
  - No manipulas, describes cómo debe verse
  - Cambio de estado → actualización automática de UI
  - Menos código, más declarativo
  - No manipulas el DOM, defines cómo debe renderizarse según los datos

### 1.2 Consumo de APIs externas (5 min)

- **API REST como fuente de datos**
  - Backend externo proporciona datos JSON
  - Frontend los consume y renderiza

- **Dos momentos de carga:**
  - **Datos en pageload (SSR):** Se cargan en el servidor antes de enviar HTML
  - **Datos asíncronos (client-side):** Se cargan después en el navegador
  - **Flujo básico:** Request → Response → Renderizado

### 1.3 TypeScript básico (10 min)

- **¿Qué es TypeScript?**
  - JavaScript con tipos estáticos
  - Detecta errores antes de ejecutar el código

- **Tipos básicos:**
  - `string`, `number`, `boolean`
  - `string[]` (array de strings)
  - `{ id: string, name: string }` (objeto)

- **Interfaces y tipos personalizados:**

  ```typescript
  type Activity = {
  	id: string;
  	title: string;
  	status: 'DRAFT' | 'PUBLISHED';
  };
  ```

- **Beneficios:**
  - Autocompletado en el editor
  - Errores en tiempo de desarrollo (no en producción)
  - Documentación viva del código

### 1.4 Sistema de rutas basado en archivos (5 min)

- **Carpetas = URLs**
  - `src/routes/activities/` → `/activities`
  - `src/routes/about/` → `/about`

- **Archivos especiales:**
  - `+page.svelte` - La página
  - `+page.server.ts` - Lógica del servidor
  - `+layout.svelte` - Layout compartido

- **Grupos de rutas (paréntesis):**
  - `(backoffice)/` - Agrupa sin afectar la URL
  - `(auth)/login/` → URL es `/login`, no `/(auth)/login`

---

### 2.1 Organización de carpetas principales

```
buendia-frontend-core/
├── src/
│   ├── routes/          # Páginas (rutas automáticas)
│   │   ├── (backoffice)/ # Grupo: backoffice
│   │   ├── (auth)/       # Grupo: autenticación
│   │   └── +layout.svelte # Layout raíz
│   │
│   ├── lib/             # Código reutilizable
│   │   ├── api/         # Cliente API y endpoints
│   │   ├── components/  # Componentes UI
│   │   ├── utils/       # Funciones auxiliares
│   │   ├── types.ts     # Tipos TypeScript
│   │   └── config/      # Configuraciones
│   │
│   ├── paraglide/       # i18n (auto-generado)
│   ├── app.html         # Plantilla HTML base
│   └── app.d.ts         # Tipos globales
│
├── static/              # Assets estáticos (imágenes, fuentes)
├── scripts/             # Scripts de build/generación
└── [archivos config]    # svelte.config.js, package.json, etc.
```

### 2.2 Archivos de configuración importantes

- **`svelte.config.js`** - Configuración de SvelteKit
  - Adapter (cómo se despliega)
  - Preprocesadores (Tailwind, Melt-UI)
  - Features experimentales (Remote Functions)

- **`package.json`** - Dependencias y scripts npm
  - `npm run dev` - Servidor de desarrollo
  - `npm run build` - Build de producción
  - `npm run check` - Verificar tipos

- **`.env`** - Variables de entorno
  - `PUBLIC_API_BASE_URL` - URL de la API externa
  - `PUBLIC_GOOGLE_MAPS_API_KEY` - API key de Google Maps

### 2.3 Alias y convenciones

- **`$lib/...`** - Atajo para importar desde `src/lib/`

  ```typescript
  import { api } from '$lib/api/index';
  // Equivale a: ../../../lib/api/index
  ```

- **`+` prefijo** - Archivos especiales de SvelteKit
  - `+page.svelte` - Página
  - `+page.server.ts` - Código del servidor
  - `+layout.svelte` - Layout

- **`.server.ts`** - Solo se ejecuta en el servidor (nunca en el navegador)

---

## PARTE 3: SVELTE BÁSICO

### 3.1 Estructura de un componente .svelte

```svelte
<script lang="ts">
	// 1. LÓGICA: JavaScript/TypeScript
	let count = $state(0);

	function increment() {
		count++;
	}
</script>

<!-- 2. TEMPLATE: HTML reactivo -->
<button onclick={increment}>
	Clicks: {count}
</button>

<style>
	/* 3. ESTILOS: CSS con scope (solo afecta este componente) */
	button {
		background: blue;
		color: white;
	}
</style>
```

### 3.2 Runes de Svelte 5 (sistema de reactividad)

**IMPORTANTE:** Este proyecto usa **Svelte 5** (nueva sintaxis con runes)

#### `$state()` - Estado local reactivo

```svelte
<script lang="ts">
	// Estado reactivo
	let count = $state(0);
	let user = $state({ name: 'John', age: 30 });

	function increment() {
		count++; // ✅ Actualización directa
	}

	function updateName() {
		user.name = 'Jane'; // ✅ Mutación directa funciona
	}
</script>

<p>Count: {count}</p><p>User: {user.name}, {user.age}</p>
```

#### `$props()` - Recibir datos del padre

```svelte
<script lang="ts">
	// Recibir props del componente padre
	let { title, count } = $props<{ title: string; count: number }>();
</script>

<h1>{title}</h1><p>Count: {count}</p>
```

```svelte
<!-- Padre: pasar props -->
<MyComponent title="Hello" count={42} />
```

#### `$derived()` - Valores calculados

```svelte
<script lang="ts">
	let count = $state(0);

	// Valor derivado (se recalcula automáticamente)
	const doubled = $derived(count * 2);
	const isEven = $derived(count % 2 === 0);
</script>

<p>Count: {count}</p><p>Doubled: {doubled}</p><p>Is even: {isEven}</p>
```

#### `$effect()` - Efectos secundarios

```svelte
<script lang="ts">
	let count = $state(0);

	// Efecto que se ejecuta cuando count cambia
	$effect(() => {
		console.log('Count changed:', count);
		document.title = `Count: ${count}`;

		// Cleanup (se ejecuta antes del siguiente efecto)
		return () => {
			console.log('Cleaning up');
		};
	});
</script>
```

### 3.3 Sintaxis de template

#### Interpolación

```svelte
<script lang="ts">
	let name = $state('World');
	let count = $state(42);
</script>

<p>Hello {name}!</p><p>Count: {count}</p><p>Doubled: {count * 2}</p>
```

#### Condicionales

```svelte
<script lang="ts">
	let isLoggedIn = $state(false);
	let role = $state<'admin' | 'user'>('user');
</script>

{#if isLoggedIn}
	<p>Welcome back!</p>
{:else}
	<p>Please log in</p>
{/if}

{#if role === 'admin'}
	<button>Admin Panel</button>
{:else if role === 'user'}
	<button>User Dashboard</button>
{:else}
	<p>Unknown role</p>
{/if}
```

#### Bucles

```svelte
<script lang="ts">
	let items = $state([
		{ id: 1, name: 'Apple' },
		{ id: 2, name: 'Banana' },
		{ id: 3, name: 'Cherry' }
	]);
</script>

<ul>
	{#each items as item}
		<li>{item.name}</li>
	{/each}
</ul>

<!-- Con key para optimización -->
<ul>
	{#each items as item (item.id)}
		<li>{item.name}</li>
	{/each}
</ul>
```

#### Eventos

```svelte
<script lang="ts">
	let count = $state(0);

	function handleClick() {
		count++;
	}

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		console.log('Input value:', target.value);
	}
</script>

<!-- Eventos inline -->
<button onclick={() => count++}>Increment</button>

<!-- Eventos con función -->
<button onclick={handleClick}>Increment</button>

<!-- Eventos con parámetros -->
<button onclick={() => (count += 5)}>Add 5</button>

<!-- Input events -->
<input oninput={handleInput} />
```

#### Binding (two-way)

```svelte
<script lang="ts">
	let name = $state('');
	let isChecked = $state(false);
	let selected = $state('option1');
</script>

<!-- Bind input value -->
<input type="text" bind:value={name} />
<p>Hello {name}</p>

<!-- Bind checkbox -->
<input type="checkbox" bind:checked={isChecked} />

<!-- Bind select -->
<select bind:value={selected}>
	<option value="option1">Option 1</option>
	<option value="option2">Option 2</option>
</select>
```

### 3.4 Props y comunicación entre componentes

#### Pasar datos de padre a hijo

```svelte
<!-- Child.svelte -->
<script lang="ts">
	let { title, count } = $props<{ title: string; count: number }>();
</script>

<h2>{title}</h2><p>Count: {count}</p>
```

```svelte
<!-- Parent.svelte -->
<script lang="ts">
	import Child from './Child.svelte';

	let count = $state(42);
</script>

<Child title="My Component" {count} />
```

#### `$bindable()` para two-way binding

```svelte
<!-- FormInput.svelte -->
<script lang="ts">
	let { value = $bindable('') } = $props<{ value: string }>();
</script>

<input type="text" bind:value />
```

```svelte
<!-- Parent.svelte -->
<script lang="ts">
	import FormInput from './FormInput.svelte';

	let name = $state('');
</script>

<FormInput bind:value={name} /><p>Name: {name}</p>
```

---

## PARTE 4: RUTAS Y PÁGINAS (20 min)

### 4.1 Tipos de archivos de ruta

| Archivo             | Propósito                       | Dónde se ejecuta         |
| ------------------- | ------------------------------- | ------------------------ |
| `+page.svelte`      | UI de la página                 | Cliente + Servidor (SSR) |
| `+page.server.ts`   | Lógica del servidor             | Solo servidor            |
| `+layout.svelte`    | Layout compartido para hijos    | Cliente + Servidor (SSR) |
| `+layout.server.ts` | Lógica del servidor para layout | Solo servidor            |
| `+error.svelte`     | Página de error                 | Cliente + Servidor (SSR) |
| `+server.ts`        | API endpoint (REST)             | Solo servidor            |

### 4.2 Load functions (carga de datos SSR)

**`+page.server.ts` - Server Load:**

```typescript
import type { PageServerLoad } from './$types';
import { api } from '$lib/api/index';

export const load: PageServerLoad = async ({ fetch, params }) => {
	// 1. Fetch datos desde la API
	const activities = await api.activities.getAll(fetch, { page: 1 });

	// 2. Return data → accesible en +page.svelte
	return {
		activities: activities.data,
		pagination: activities.pagination
	};
};
```

**`+page.svelte` - Usar datos:**

```svelte
<script lang="ts">
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	// Acceder a los datos del load
	const activities = $derived(data.activities);
</script>

<h1>Activities</h1>

<ul>
	{#each activities as activity}
		<li>{activity.title}</li>
	{/each}
</ul>
```

**Ventajas del Load:**

- ✅ Datos disponibles en el primer render (SEO)
- ✅ No hay "loading spinner" inicial
- ✅ Se ejecuta en cada navegación

### 4.3 Rutas dinámicas

**Estructura:**

```
activities/
├── +page.svelte           # /activities (lista)
└── [slug]/                # /activities/[slug] (dinámico)
    ├── +page.svelte       # Detalle
    ├── +page.server.ts    # Load con params.slug
    └── edit/
        └── +page.svelte   # /activities/[slug]/edit
```

**Acceso a parámetros:**

```typescript
// +page.server.ts
export const load: PageServerLoad = async ({ params, fetch }) => {
	// params.slug contiene el valor dinámico de la URL
	const activity = await api.activities.getBySlug(fetch, params.slug);

	return { activity };
};
```

**Ejemplo de URLs:**

- `/activities/lisbon-food-tour` → `params.slug = "lisbon-food-tour"`
- `/activities/porto-wine-tasting` → `params.slug = "porto-wine-tasting"`

### 4.4 Navegación

#### Links (progresivo)

```svelte
<!-- Navegación básica -->
<a href="/activities">Ver actividades</a>

<!-- Con parámetros -->
<a href="/activities/{activity.slug}">Ver {activity.title}</a>

<!-- Query params -->
<a href="/activities?page=2&status=PUBLISHED">Página 2</a>
```

#### Navegación programática

```svelte
<script lang="ts">
	import { goto } from '$app/navigation';

	function handleClick() {
		// Navegar a otra página
		goto('/activities');
	}

	function handleFilter() {
		// Navegar con query params
		goto('/activities?status=PUBLISHED', {
			replaceState: true, // No agregar a historial
			noScroll: true, // Mantener scroll
			keepFocus: true // Mantener foco
		});
	}
</script>

<button onclick={handleClick}>Go to activities</button>
<button onclick={handleFilter}>Filter</button>
```

---

## PARTE 5: CONSUMO DE APIs (25 min)

### 5.1 Arquitectura de la capa API

**Estructura:**

```
src/lib/api/
├── config.ts              # Configuración (timeout, retry, baseURL)
├── client.ts              # Cliente HTTP reutilizable
├── errors.ts              # Clases de error personalizadas
├── types.ts               # Tipos TypeScript para API
├── endpoints.config.ts    # Definición de todos los endpoints
├── common.remote.ts       # Remote Functions (queries simples)
├── endpoints/             # Módulos por recurso
│   ├── activities.ts      # CRUD de activities
│   ├── destinations.ts    # CRUD de destinations
│   ├── attractions.ts     # CRUD de attractions
│   └── ...
└── index.ts               # Export unificado
```

**Cliente API centralizado:**

```typescript
// $lib/api/client.ts
export class ApiClient {
	// ✅ Retry automático (3 intentos)
	// ✅ Timeout configurable (30s default)
	// ✅ Error handling tipado
	// ✅ Logging en desarrollo

	async request<T>(fetch: typeof fetch, path: string, options?: ApiRequestOptions) {
		// Lógica de retry, timeout, error handling
	}
}

export const apiClient = new ApiClient(apiConfig);
```

**Uso en endpoints:**

```typescript
// $lib/api/endpoints/activities.ts
export const activitiesEndpoints = {
	async getAll(fetchFn: typeof fetch, params?: any) {
		const response = await apiClient.request(fetchFn, '/activities', { method: 'GET' });
		return response.data;
	},

	async getBySlug(fetchFn: typeof fetch, slug: string) {
		const response = await apiClient.request(fetchFn, `/activities/${slug}`, { method: 'GET' });
		return response.data;
	},

	async create(fetchFn: typeof fetch, data: any) {
		const response = await apiClient.request(fetchFn, '/activities', {
			method: 'POST',
			body: JSON.stringify(data)
		});
		return response.data;
	}
};
```

### 5.2 Load functions para datos iniciales (SSR)

**Cargar datos en el servidor antes de renderizar:**

```typescript
// +page.server.ts
import { api, ApiError } from '$lib/api/index';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		// Fetch de la API externa
		const activity = await api.activities.getBySlug(fetch, params.slug);

		return { activity };
	} catch (err) {
		// Error handling tipado
		if (err instanceof ApiError) {
			if (err.type === 'not_found') {
				throw error(404, 'Activity not found');
			}
			throw error(err.status || 500, err.message);
		}

		throw error(503, 'Service unavailable');
	}
};
```

**¿Por qué pasar `fetch`?**

- SvelteKit necesita rastrear las requests para SSR
- Habilita caching y hydration correcta
- **Siempre** pasa `fetch` a las funciones de API

### 5.3 Remote Functions para datos asíncronos

**¿Qué son?** Funciones que se ejecutan en el servidor pero se llaman desde el cliente (como si fueran locales).

**Definición (`*.remote.ts`):**

```typescript
// $lib/api/common.remote.ts
import { query } from '$app/server';
import { apiClient } from './client';

export const getDestinationKinds = query(async () => {
	const response = await apiClient.request(fetch, '/destination-kind');
	return response.data;
});
```

**Uso en componente:**

```svelte
<script lang="ts">
  import { getDestinationKinds } from '$lib/api/common.remote';
</script>

<!-- Forma 1: Con await (recomendado) -->
<select>
  {#each await getDestinationKinds() as kind}
    <option value={kind.id}>{kind.name}</option>
  {/each}
</select>

<!-- Forma 2: Con manejo de loading/error -->
<script>
  const query = getDestinationKinds();
</script>

{#if query.loading}
  <p>Loading...</p>
{:else if query.error}
  <p>Error: {query.error.message}</p>
{:else}
  {#each query.current as kind}
    <option value={kind.id}>{kind.name}</option>
  {/each}
{/if}
```

**Ventajas:**

- ✅ Type-safe (tipos automáticos)
- ✅ Se ejecuta en el servidor (acceso a secrets)
- ✅ Sintaxis declarativa con `{#await}`
- ✅ Menos código que fetch manual

### 5.4 Form Actions para mutaciones

**Definir action en el servidor:**

```typescript
// +page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { api } from '$lib/api/index';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		// 1. Validar datos del formulario
		const form = await superValidate(request, zod(activitySchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		// 2. Llamar a la API
		try {
			const activity = await api.activities.create(fetch, form.data);

			// 3. Redirigir al éxito
			throw redirect(303, `/activities/${activity.slug}`);
		} catch (err) {
			// 4. Error: devolver form con errores
			return fail(500, { form, error: 'Failed to create activity' });
		}
	}
};
```

**Usar action en el componente:**

```svelte
<script lang="ts">
	import { superForm } from 'sveltekit-superforms';

	let { data } = $props();
	const { form, errors, enhance } = superForm(data.form);
</script>

<form method="POST" use:enhance>
	<label>
		Title
		<input name="title" bind:value={$form.title} />
		{#if $errors.title}<span class="error">{$errors.title}</span>{/if}
	</label>

	<button type="submit">Create</button>
</form>
```

**Características:**

- ✅ Progressive enhancement (funciona sin JS)
- ✅ Validación client + server
- ✅ Loading states automáticos
- ✅ Error handling integrado

### 5.5 Manejo de errores

**Tipos de error:**

```typescript
type ApiErrorType =
	| 'network' // Sin conexión
	| 'timeout' // Request timeout
	| 'not_found' // 404
	| 'unauthorized' // 401
	| 'forbidden' // 403
	| 'validation' // 422 (datos inválidos)
	| 'server_error' // 500+
	| 'unknown'; // Otro error

class ApiError extends Error {
	type: ApiErrorType;
	status?: number;
	url: string;
	data?: unknown;
}
```

**Pattern de manejo:**

```typescript
try {
	const result = await api.activities.create(fetch, data);
} catch (err) {
	if (err instanceof ApiError) {
		switch (err.type) {
			case 'validation':
				// Mostrar errores de validación
				console.error('Validation errors:', err.data);
				break;

			case 'not_found':
				throw error(404, 'Resource not found');

			case 'server_error':
				throw error(500, 'Internal server error');
		}
	}

	// Error desconocido
	throw error(503, 'Service unavailable');
}
```

**Flash messages para feedback:**

```typescript
import { setFlashMessage } from '$lib/server/flashMessages';

// En action
setFlashMessage(cookies, {
	type: 'success',
	message: 'Activity created successfully!'
});
```

---

## PARTE 6: COMPONENTES Y UI (15 min)

### 6.1 Componentes de formulario

**Componentes disponibles en `$lib/components/forms/`:**

- `FormInputText` - Input de texto
- `FormInputSlug` - Input con generación automática de slug
- `FormTextarea` - Textarea
- `FormTextareaMarkdown` - Textarea con editor Markdown
- `FormSelect` - Select dropdown
- `FormCheckboxGroup` - Grupo de checkboxes
- `FormTagManager` - Gestor de tags con autocompletado
- `FormErrorMsg` - Mensaje de error

**Pattern de uso:**

```svelte
<script lang="ts">
	import FormInputText from '$lib/components/forms/FormInputText.svelte';
	import FormTextarea from '$lib/components/forms/FormTextarea.svelte';
	import FormSelect from '$lib/components/forms/FormSelect.svelte';

	let title = $state('');
	let description = $state('');
	let status = $state('DRAFT');

	let titleError = $state<string | undefined>();
</script>

<FormInputText id="title" label="Title" bind:value={title} error={titleError} required />

<FormTextarea id="description" label="Description" bind:value={description} rows={5} />

<FormSelect
	id="status"
	label="Status"
	bind:value={status}
	options={[
		{ value: 'DRAFT', label: 'Draft' },
		{ value: 'PUBLISHED', label: 'Published' }
	]}
/>
```

**Props comunes:**

- `id` - ID del input (required)
- `label` - Etiqueta del campo
- `value` - Valor (usar con `bind:`)
- `error` - Mensaje de error (string | undefined)
- `required` - Campo obligatorio
- `disabled` - Campo deshabilitado
- `readonly` - Solo lectura

### 6.2 Componentes reutilizables

**Importar desde $lib:**

```svelte
<script lang="ts">
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import Tag from '$lib/components/Tag.svelte';
	import StarRating from '$lib/components/StarRating.svelte';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
</script>

<Breadcrumb items={breadcrumbs} />

<div class="tags">
	{#each tags as tag}
		<Tag label={tag.name} color="primary" />
	{/each}
</div>

<StarRating rating={4.5} max={5} />

<ThemeSwitcher />
```

**Slots para contenido dinámico:**

```svelte
<!-- Card.svelte -->
<div class="card">
	<slot name="header" />
	<slot />
	<!-- Default slot -->
	<slot name="footer" />
</div>

<!-- Uso -->
<Card>
	<h2 slot="header">Title</h2>
	<p>Content goes here</p>
	<button slot="footer">Action</button>
</Card>
```

### 6.3 Sistema de estilos

#### Tailwind CSS (utility-first)

```svelte
<button class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"> Click me </button>

<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
	<!-- Responsive grid -->
</div>

<p class="text-sm text-gray-600 dark:text-gray-300">
	<!-- Dark mode support -->
</p>
```

**Clases útiles:**

- Layout: `flex`, `grid`, `container`
- Spacing: `p-4` (padding), `m-2` (margin), `gap-4`
- Colors: `bg-blue-500`, `text-red-600`, `border-gray-300`
- Responsive: `md:`, `lg:`, `xl:`
- States: `hover:`, `focus:`, `disabled:`

#### DaisyUI (componentes pre-estilizados)

```svelte
<!-- Botones -->
<button class="btn">Normal</button>
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-outline btn-error">Outline Error</button>
<button class="btn btn-sm">Small</button>
<button class="btn btn-lg">Large</button>

<!-- Form -->
<input type="text" class="input input-bordered" />
<select class="select select-bordered">
	<option>Option 1</option>
</select>
<textarea class="textarea textarea-bordered"></textarea>

<!-- Card -->
<div class="card bg-base-100 shadow-xl">
	<div class="card-body">
		<h2 class="card-title">Card Title</h2>
		<p>Card content</p>
	</div>
</div>

<!-- Badge -->
<span class="badge badge-primary">New</span>
<span class="badge badge-success">Active</span>

<!-- Table -->
<table class="table-zebra table">
	<thead>
		<tr><th>Name</th><th>Email</th></tr>
	</thead>
	<tbody>
		<tr><td>John</td><td>john@example.com</td></tr>
	</tbody>
</table>
```

#### Scoped styles en componentes

```svelte
<div class="my-component">
	<h1>Title</h1>
</div>

<style>
	/* Estos estilos solo afectan este componente */
	.my-component {
		padding: 1rem;
		background: var(--color-base-100);
	}

	h1 {
		color: var(--color-primary);
		font-size: 2rem;
	}
</style>
```

### 6.4 Iconos

**svelte-iconoir library:**

```svelte
<script lang="ts">
	import {
		Calendar,
		Cancel,
		Plus,
		Map,
		Search,
		Edit,
		Trash,
		Check,
		InfoEmpty
	} from 'svelte-iconoir';
</script>

<!-- Iconos simples -->
<Plus />
<Calendar />

<!-- Con clases CSS -->
<Search class="text-primary" />
<Trash class="text-error" />

<!-- En botones -->
<button class="btn btn-primary">
	<Plus />
	Add New
</button>

<button class="btn btn-square btn-error">
	<Trash />
</button>
```

**Personalización:**

- `class` - Clases CSS (color, tamaño)
- `strokeWidth` - Grosor del trazo
- `width` / `height` - Dimensiones

---

## PARTE 7: PATTERNS Y WORKFLOWS (10 min)

### 7.1 Flujo típico de desarrollo

**Iniciar el proyecto:**

```bash
# 1. Clonar y entrar al directorio
cd buendia-frontend-core

# 2. Instalar dependencias
npm install

# 3. Copiar variables de entorno
cp .env.example .env
# Editar .env con la URL de la API

# 4. Generar enums desde la API
npm run generate:enums

# 5. Iniciar servidor de desarrollo
npm run dev -- --open
# Se abre en http://localhost:5173
```

**Workflow diario:**

```bash
# Terminal 1: Servidor de desarrollo
npm run dev

# Terminal 2 (opcional): Type checking en vivo
npm run check:watch

# Antes de commit
npm run format   # Auto-formatear código
npm run lint     # Verificar estilo
npm run check    # Verificar tipos
```

**Hot Module Replacement (HMR):**

- Cambios en `.svelte` → actualización instantánea
- Cambios en `.ts` → actualización instantánea
- Cambios en CSS → actualización instantánea
- Cambios en `.server.ts` → reinicio automático del servidor

### 7.2 Filtros URL-driven

**Filosofía:** La URL es la única fuente de verdad para filtros, paginación y ordenación.

**Ventajas:**

- ✅ URLs compartibles
- ✅ Botones atrás/adelante funcionan
- ✅ SEO-friendly
- ✅ Sin bugs de sincronización de estado

**Ejemplo completo:**

```typescript
// filters.schema.ts - Definir estructura
export type ActivitiesFilters = {
	page: number;
	pageSize: number;
	status?: 'DRAFT' | 'PUBLISHED';
	search?: string;
};

export const activitiesFiltersSchema: FiltersSchema<ActivitiesFilters> = {
	fields: {
		page: createPageField(),
		pageSize: createPageSizeField(),
		status: createStringField('status'),
		search: createStringField('search')
	}
};
```

```typescript
// +page.server.ts - Parsear y usar
import { parseFilters } from '$lib/utils/filters';

export const load: PageServerLoad = async ({ fetch, url }) => {
	// URL → Objeto tipado
	const filters = parseFilters(activitiesFiltersSchema, url.searchParams);
	// ?page=2&status=PUBLISHED → { page: 2, pageSize: 10, status: 'PUBLISHED' }

	// Usar filtros en API
	const response = await api.activities.getAll(fetch, filters);

	return {
		items: response.data,
		pagination: response.pagination,
		filters // Pasar a cliente para sincronizar UI
	};
};
```

```svelte
<!-- +page.svelte - UI y actualización -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { patchFilters } from '$lib/utils/filters';

	let { data } = $props();
	const filters = $derived(data.filters);

	function applyFilterPatch(patch: Partial<ActivitiesFilters>) {
		const currentParams = $page.url.searchParams;
		const newParams = patchFilters(activitiesFiltersSchema, currentParams, patch);

		// Actualizar URL → triggers server reload → nuevos datos
		goto(`?${newParams.toString()}`, {
			replaceState: true, // No agregar a historial
			noScroll: true, // Mantener posición de scroll
			keepFocus: true // Mantener foco
		});
	}

	function handleStatusChange(status: string | null) {
		applyFilterPatch({ status: status || undefined, page: 1 });
	}

	function handleSearchChange(search: string) {
		applyFilterPatch({ search: search || undefined, page: 1 });
	}
</script>

<!-- UI -->
<input
	type="text"
	value={filters.search || ''}
	oninput={(e) => handleSearchChange(e.currentTarget.value)}
	placeholder="Search..."
/>

<select value={filters.status || ''} onchange={(e) => handleStatusChange(e.currentTarget.value)}>
	<option value="">All</option>
	<option value="DRAFT">Draft</option>
	<option value="PUBLISHED">Published</option>
</select>

<p>Page: {filters.page} | Status: {filters.status || 'All'}</p>
```

### 7.3 CRUD pattern típico

**Estructura de carpetas:**

```
activities/
├── +page.svelte              # LIST - Tabla con filtros
├── +page.server.ts           # Load: fetch all with filters
├── filters.schema.ts         # Schema de filtros
├── activity-form.schema.ts   # Schema de validación
├── create/
│   ├── +page.svelte          # CREATE - Formulario vacío
│   └── +page.server.ts       # Load: init form, Action: create
├── [slug]/
│   ├── +page.svelte          # DETAIL - Vista de solo lectura
│   ├── +page.server.ts       # Load: fetch by slug
│   ├── edit/
│   │   ├── +page.svelte      # UPDATE - Formulario con datos
│   │   └── +page.server.ts   # Load: fetch + init form, Action: update
│   └── delete/
│       ├── +page.svelte      # DELETE - Confirmación
│       └── +page.server.ts   # Load: fetch, Action: delete
└── components/               # Componentes compartidos
    └── ActivityForm.svelte
```

**Pattern de uso:**

1. **LIST:** Load → API.getAll → Renderizar tabla
2. **CREATE:** Load → Init form → Action → API.create → Redirect
3. **DETAIL:** Load → API.getBySlug → Renderizar vista
4. **UPDATE:** Load → API.getBySlug + Init form → Action → API.update → Redirect
5. **DELETE:** Load → API.getBySlug → Action → API.delete → Redirect

### 7.4 Scripts útiles

**Package.json scripts:**

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo (port 5173)
npm run dev -- --open    # Servidor + abrir navegador

# Build
npm run build            # Build de producción
npm run preview          # Preview del build

# Quality
npm run check            # Verificar tipos TypeScript
npm run check:watch      # Verificar tipos (watch mode)
npm run format           # Auto-formatear código (Prettier)
npm run lint             # Verificar estilo (ESLint)

# Generación
npm run generate:enums   # Generar enums desde API
```

**Workflow recomendado antes de commit:**

```bash
npm run format && npm run lint && npm run check
```

---

## PARTE 8: HANDS-ON PRÁCTICA (10 min)

### 8.1 Ejercicio guiado: Crear una página simple

**Objetivo:** Crear una página que muestre una lista de tags desde la API.

**Paso 1: Crear la ruta**

```bash
# Crear carpeta
mkdir -p src/routes/(backoffice)/tags

# Crear archivos
touch src/routes/(backoffice)/tags/+page.svelte
touch src/routes/(backoffice)/tags/+page.server.ts
```

**Paso 2: Load function (server)**

```typescript
// +page.server.ts
import type { PageServerLoad } from './$types';
import { api } from '$lib/api/index';

export const load: PageServerLoad = async ({ fetch }) => {
	const tags = await api.tags.getAll(fetch);

	return { tags };
};
```

**Paso 3: Renderizar (client)**

```svelte
<!-- +page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import Tag from '$lib/components/Tag.svelte';

	let { data } = $props<{ data: PageData }>();
	const tags = $derived(data.tags);
</script>

<div class="backoffice-container">
	<h1 class="mb-4 text-2xl font-bold">Tags</h1>

	<div class="flex flex-wrap gap-2">
		{#each tags as tag}
			<Tag label={tag.name} color="primary" />
		{/each}
	</div>
</div>
```

**Paso 4: Probar**

```bash
# Iniciar dev server
npm run dev

# Abrir http://localhost:5173/tags
```

**Paso 5: Agregar un filtro simple**

```svelte
<!-- Agregar input de búsqueda -->
<script lang="ts">
	let searchTerm = $state('');

	const filteredTags = $derived(
		tags.filter((tag) => tag.name.toLowerCase().includes(searchTerm.toLowerCase()))
	);
</script>

<input
	type="text"
	class="input input-bordered"
	bind:value={searchTerm}
	placeholder="Search tags..."
/>

<div class="flex flex-wrap gap-2">
	{#each filteredTags as tag}
		<Tag label={tag.name} color="primary" />
	{/each}
</div>
```

### 8.2 Debugging básico

**Console.log en script:**

```svelte
<script lang="ts">
	let { data } = $props();

	// Debug: imprimir datos
	console.log('Page data:', data);

	const items = $derived(data.items);
	console.log('Items:', items);

	// Debug en effect
	$effect(() => {
		console.log('Items changed:', items);
	});
</script>
```

**DevTools de Svelte:**

1. Instalar extensión: [Svelte DevTools](https://chrome.google.com/webstore/detail/svelte-devtools/ckolcbmkjpjmangdbmnkpjigpkddpogn)
2. Abrir DevTools → Tab "Svelte"
3. Inspeccionar componentes, props, y estado

**Leer errores de TypeScript:**

```
Error: Type 'string | undefined' is not assignable to type 'string'
         ^^^^^^^^^^^^^^^^^^^^^^^^                        ^^^^^^
         Tipo que tienes                                 Tipo esperado
```

**Solución típica:** Añadir check:

```typescript
// ❌ Error
const name: string = data.user?.name;

// ✅ OK
const name: string = data.user?.name || 'Unknown';

// ✅ OK con guard
if (data.user?.name) {
	const name: string = data.user.name;
}
```

### 8.3 Recursos y siguientes pasos

**Documentación:**

- **Svelte oficial:** https://svelte.dev/docs
- **SvelteKit oficial:** https://kit.svelte.dev/docs
- **Svelte 5 runes:** https://svelte-5-preview.vercel.app/docs/runes
- **Tailwind CSS:** https://tailwindcss.com/docs
- **DaisyUI:** https://daisyui.com/components/

**Documentación del proyecto:**

- `README.md` - Guía general del proyecto
- `DEPENDENCIES.md` - Detalles de dependencias
- `src/routes/api/README.md` - Documentación de Remote Functions
- `/api-catalog` - Catálogo de endpoints en vivo

**A quién preguntar:**

- **Dudas de Svelte/SvelteKit:** Team lead, documentación oficial
- **Dudas de TypeScript:** Team lead, [TypeScript docs](https://www.typescriptlang.org/docs/)
- **Dudas de la API externa:** Backend team, documentación de API
- **Dudas del proyecto:** README.md, compañeros de equipo

**Próximos pasos sugeridos:**

1. Explorar las páginas existentes (`/activities`, `/destinations`)
2. Leer el código de un componente de formulario
3. Crear una página simple siguiendo el ejercicio guiado
4. Experimentar con filtros URL-driven
5. Probar a crear un componente reutilizable
6. Leer la documentación de Svelte 5 sobre runes

---

## TIMING BREAKDOWN

| Parte     | Tema                    | Duración     |
| --------- | ----------------------- | ------------ |
| 1         | Conceptos fundamentales | 30 min       |
| 2         | Estructura del proyecto | 20 min       |
| 3         | Svelte básico           | 30 min       |
| 4         | Rutas y páginas         | 20 min       |
| 5         | Consumo de APIs         | 25 min       |
| 6         | Componentes y UI        | 15 min       |
| 7         | Patterns y workflows    | 10 min       |
| 8         | Hands-on práctica       | 10 min       |
| **Total** |                         | **2h 40min** |

_Ajustar según ritmo del grupo. Priorizar Partes 1-5 si hay restricción de tiempo._

---

## NOTAS PARA EL INSTRUCTOR

### Conceptos clave a enfatizar:

1. **Reactividad declarativa** vs manipulación imperativa del DOM
2. **SSR (Server-Side Rendering)** - Los datos se cargan en el servidor primero
3. **File-based routing** - Carpetas = URLs
4. **Type-safety** - TypeScript previene errores antes de ejecutar
5. **URL como estado** - Filtros en la URL, no en memoria
6. **Progressive enhancement** - Funciona sin JS cuando es posible

### Errores comunes a anticipar:

1. **Olvidar pasar `fetch` a funciones de API** → Error de hydration
2. **Usar sintaxis de Svelte 4** (`export let`, `$:`) en vez de runes
3. **Mutación incorrecta de arrays/objetos** → Usar spread operator o métodos inmutables
4. **No tipar props correctamente** → Errores de TypeScript
5. **Confundir `.svelte` con `.server.ts`** → Código del cliente en el servidor o viceversa

### Demos recomendadas:

1. Crear una página desde cero en vivo
2. Mostrar HMR en acción (cambiar código y ver actualización)
3. Debuggear un error de TypeScript juntos
4. Mostrar cómo funciona un filtro URL-driven
5. Comparar jQuery (imperativo) vs Svelte (reactivo) con ejemplo simple

---

**Versión:** 1.0  
**Última actualización:** 2026-02-06  
**Audiencia:** Junior frontend developers (jQuery/Drupal background)  
**Proyecto:** buendia-frontend-core (SvelteKit + TypeScript)
