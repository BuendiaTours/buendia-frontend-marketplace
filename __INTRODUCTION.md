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
│   ├── routes/                    # Páginas (rutas automáticas)
│   │   ├── (backoffice)/          # Grupo: backoffice (admin panel)
│   │   │   └── backoffice/
│   │   │       ├── (auth)/        # Grupo: autenticación (ANIDADO)
│   │   │       ├── activities/
│   │   │       ├── destinations/
│   │   │       └── ...
│   │   ├── (marketplace)/         # Grupo: marketplace (público)
│   │   ├── (marketplace-checkout)/ # Grupo: checkout
│   │   └── +layout.svelte         # Layout raíz
│   │
│   ├── lib/                       # Código reutilizable
│   │   ├── api/                   # Cliente API y endpoints
│   │   │   ├── shared/            # Código compartido (config, client, errors)
│   │   │   ├── backoffice/        # API del backoffice
│   │   │   └── marketplace/       # API del marketplace
│   │   ├── components/            # Componentes UI
│   │   │   ├── backoffice/        # Componentes del backoffice
│   │   │   └── marketplace/       # Componentes del marketplace
│   │   ├── utils/                 # Funciones auxiliares
│   │   ├── types.ts               # Tipos TypeScript
│   │   └── config/                # Configuraciones
│   │
│   ├── paraglide/                 # i18n (auto-generado)
│   ├── app.html                   # Plantilla HTML base
│   └── app.d.ts                   # Tipos globales
│
├── static/                        # Assets estáticos (imágenes, fuentes)
├── scripts/                       # Scripts de build/generación
└── [archivos config]              # svelte.config.js, package.json, etc.
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

### 2.3 Arquitectura Dual: Backoffice vs Marketplace

Este proyecto maneja **dos dominios separados** con código, componentes y APIs independientes:

#### **Backoffice (Admin Panel)**

- **Rutas:** `(backoffice)/backoffice/`
  - `/backoffice/activities` - Gestión de actividades
  - `/backoffice/destinations` - Gestión de destinos
  - `/backoffice/login` - Autenticación de admins
- **Componentes:** `$lib/components/backoffice/`
  - Formularios complejos (FormInputText, FormSelect, etc.)
  - Tablas con filtros avanzados
  - UI con DaisyUI
- **API:** `$lib/api/backoffice/`
  - CRUD completo de recursos
  - Permisos de administrador
- **Usuarios:** Administradores internos del sistema

#### **Marketplace (Público)**

- **Rutas:** `(marketplace)/`, `(marketplace-checkout)/`
  - `/actividad/[slug]` - Detalle de actividad pública
  - `/destino/[slug]` - Detalle de destino
  - `/checkout` - Proceso de compra
- **Componentes:** `$lib/components/marketplace/`
  - Componentes de catálogo
  - Carrito de compra
  - UI optimizada para conversión
- **API:** `$lib/api/marketplace/`
  - Solo lectura (consultas)
  - Datos públicos
- **Usuarios:** Clientes finales del marketplace

#### **Código Compartido**

- **`$lib/api/shared/`** - Cliente HTTP, configuración, manejo de errores
- **`$lib/utils/`** - Funciones auxiliares comunes
- **`$lib/types.ts`** - Tipos TypeScript compartidos

**¿Por qué esta separación?**

- ✅ Código más mantenible (cambios en backoffice no afectan marketplace)
- ✅ Permisos y seguridad separados
- ✅ Bundles optimizados (menos JS en marketplace)
- ✅ Equipos pueden trabajar en paralelo

### 2.4 Alias y convenciones

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

**Estructura (arquitectura dual):**

```
src/lib/api/
├── shared/                      # Código compartido entre backoffice y marketplace
│   ├── config.ts                # Configuración (timeout, retry, baseURL)
│   ├── client.ts                # Cliente HTTP reutilizable
│   ├── errors.ts                # Clases de error personalizadas (ApiError)
│   ├── types.ts                 # Tipos TypeScript para API
│   └── endpoints.config.ts      # Definición de todos los endpoints
│
├── backoffice/                  # API del backoffice (admin)
│   ├── endpoints/               # Módulos por recurso
│   │   ├── activities.ts        # CRUD completo de activities
│   │   ├── destinations.ts      # CRUD completo de destinations
│   │   ├── attractions.ts       # CRUD completo de attractions
│   │   ├── categories.ts
│   │   ├── distributives.ts
│   │   └── tags.ts
│   └── index.ts                 # Export del backoffice API
│
├── marketplace/                 # API del marketplace (público)
│   ├── endpoints/               # Módulos por recurso (solo lectura)
│   │   ├── activities.ts        # Consultas públicas de activities
│   │   ├── categories.ts
│   │   └── destinations.ts
│   └── index.ts                 # Export del marketplace API
│
└── index.ts                     # Re-exporta backoffice (backwards compatibility)
```

**Cliente API centralizado:**

```typescript
// $lib/api/shared/client.ts
export class ApiClient {
	// ✅ Retry automático (3 intentos)
	// ✅ Timeout configurable (5s default)
	// ✅ Error handling tipado (ApiError)
	// ✅ Logging en desarrollo

	async request<T>(fetch: typeof fetch, path: string, options?: ApiRequestOptions) {
		// Lógica de retry, timeout, error handling
	}
}

export const apiClient = new ApiClient(apiConfig);
```

**Uso en endpoints:**

```typescript
// $lib/api/backoffice/endpoints/activities.ts
import { apiClient } from '$lib/api/shared/client';
import { API_ENDPOINTS } from '$lib/api/shared/endpoints.config';

export const activitiesEndpoints = {
	async getAll(fetchFn: typeof fetch, params?: any) {
		const path = API_ENDPOINTS.activities.list.path();
		const response = await apiClient.request(fetchFn, path, { method: 'GET', params });
		return response.data;
	},

	async getBySlug(fetchFn: typeof fetch, slug: string) {
		const path = API_ENDPOINTS.activities.detail.path({ slug });
		const response = await apiClient.request(fetchFn, path, { method: 'GET' });
		return response.data;
	},

	async create(fetchFn: typeof fetch, data: any) {
		const path = API_ENDPOINTS.activities.create.path();
		const response = await apiClient.request(fetchFn, path, {
			method: 'POST',
			body: JSON.stringify(data)
		});
		return response.data;
	}
};
```

**Importar la API:**

```typescript
// Para código de backoffice (default)
import { api } from '$lib/api/index'; // Re-exporta backoffice

// O explícitamente
import { api } from '$lib/api/backoffice';
import { api } from '$lib/api/marketplace';
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

### 5.3 Enums y datos estáticos

**¿Qué son?** Funciones que se ejecutan en el servidor pero se llaman desde el cliente (como si fueran locales).

**Definición (`*.remote.ts`):**

```typescript
// $lib/api/backoffice/common.remote.ts
import { query } from '$app/server';
import { apiClient } from '$lib/api/shared/client';
import { API_ENDPOINTS } from '$lib/api/shared/endpoints.config';

export const getDestinationKinds = query(async () => {
	const path = API_ENDPOINTS.destinationKinds.list.path();
	const response = await apiClient.request(fetch, path);
	return response.data;
});

export const getAttractionStatuses = query(async () => {
	const path = API_ENDPOINTS.attractionStatuses.list.path();
	const response = await apiClient.request(fetch, path);
	return response.data;
});
```

**Uso en componente:**

```svelte
<script lang="ts">
  import { getDestinationKinds } from '$lib/api/backoffice/common.remote';
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

**¿Cuándo usar Remote Functions vs Load Functions?**

| Criterio          | Remote Functions                       | Load Functions                 |
| ----------------- | -------------------------------------- | ------------------------------ |
| **Timing**        | Después del render inicial             | Antes del render (SSR)         |
| **Uso ideal**     | Datos secundarios (dropdowns, filtros) | Datos principales de la página |
| **SEO**           | No indexable                           | Indexable por buscadores       |
| **Loading state** | Necesitas manejar loading              | Ya cargado al renderizar       |
| **Ejemplo**       | Lista de categorías para un select     | Detalles de una actividad      |

**Ventajas:**

- ✅ Type-safe (tipos automáticos)
- ✅ Se ejecuta en el servidor (acceso a secrets)
- ✅ Sintaxis declarativa con `{#await}`
- ✅ Menos código que fetch manual
- ✅ Ideal para datos que cambian raramente (catálogos, enums)

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

**Pattern real del proyecto (con Flash messages y redirect):**

```typescript
// +page.server.ts - Action completa
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { api, ApiError } from '$lib/api/index';
import { setFlashMessage } from '$lib/server/flashMessages';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, fetch, cookies }) => {
		const form = await superValidate(request, zod(activitySchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const activity = await api.activities.create(fetch, form.data);

			// Flash message de éxito
			setFlashMessage(cookies, {
				type: 'success',
				message: 'Activity created successfully!'
			});

			// Redirigir al detalle
			throw redirect(303, `/backoffice/activities/${activity.slug}`);
		} catch (err) {
			if (err instanceof ApiError) {
				// Error tipado de la API
				return fail(err.status || 500, {
					form,
					error: err.message
				});
			}
			// Error desconocido
			return fail(500, { form, error: 'Unexpected error occurred' });
		}
	}
};
```

---

## PARTE 6: COMPONENTES Y UI (15 min)

### 6.1 Componentes de formulario

**Componentes disponibles en `$lib/components/backoffice/forms/`:**

- `FormInputText` - Input de texto
- `FormInputSlug` - Input con generación automática de slug
- `FormTextarea` - Textarea
- `FormTextareaMarkdown` - Textarea con editor Markdown (bytemd)
- `FormSelect` - Select dropdown
- `FormCheckboxGroup` - Grupo de checkboxes
- `FormTagManager` - Gestor de tags con autocompletado
- `FormGeoJson` - Editor de coordenadas geográficas
- `FormOrderedStringList` - Lista ordenada de strings (drag & drop)
- `FormOrderedObjectList` - Lista ordenada de objetos (drag & drop)
- `FormErrorMsg` - Mensaje de error

**Pattern de uso:**

```svelte
<script lang="ts">
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormTextarea from '$lib/components/backoffice/forms/FormTextarea.svelte';
	import FormSelect from '$lib/components/backoffice/forms/FormSelect.svelte';

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

**Importar desde $lib (backoffice):**

```svelte
<script lang="ts">
	import Breadcrumb from '$lib/components/backoffice/Breadcrumb.svelte';
	import Tag from '$lib/components/backoffice/Tag.svelte';
	import StarRating from '$lib/components/backoffice/StarRating.svelte';
	import ThemeSwitcher from '$lib/components/backoffice/ThemeSwitcher.svelte';
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

**Nota:** Si estás trabajando en marketplace, usa `$lib/components/marketplace/` en su lugar.

**Contenido dinámico: Slots (clásico) vs Snippets (Svelte 5)**

#### Opción 1: Slots (Funciona en Svelte 4 y 5)

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

#### Opción 2: Snippets (Nuevo en Svelte 5 - Recomendado)

```svelte
<!-- Card.svelte -->
<script lang="ts">
	let { header, children, footer } = $props<{
		header?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
		footer?: import('svelte').Snippet;
	}>();
</script>

<div class="card">
	{#if header}
		{@render header()}
	{/if}

	{#if children}
		{@render children()}
	{/if}

	{#if footer}
		{@render footer()}
	{/if}
</div>

<!-- Uso -->
<Card>
	{#snippet header()}
		<h2>Title</h2>
	{/snippet}

	<p>Content goes here</p>

	{#snippet footer()}
		<button>Action</button>
	{/snippet}
</Card>
```

**Ventajas de Snippets:**

- ✅ Type-safe (puedes tipar los parámetros del snippet)
- ✅ Más flexibles (puedes pasar datos al snippet)
- ✅ Mejor control sobre cuándo renderizar
- ✅ Pueden recibir argumentos

**Ejemplo avanzado con parámetros:**

```svelte
<!-- List.svelte -->
<script lang="ts">
	let { items, renderItem } = $props<{
		items: any[];
		renderItem: import('svelte').Snippet<[item: any, index: number]>;
	}>();
</script>

<ul>
	{#each items as item, i}
		<li>{@render renderItem(item, i)}</li>
	{/each}
</ul>

<!-- Uso -->
<List items={activities}>
	{#snippet renderItem(activity, index)}
		<strong>{index + 1}.</strong> {activity.title}
	{/snippet}
</List>
```

**¿Cuál usar?**

- **Slots:** Para casos simples, compatibilidad con Svelte 4
- **Snippets:** Para casos avanzados, mejor type-safety, código nuevo

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

# 4. Iniciar servidor de desarrollo
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
import { createPageField, createPageSizeField } from '$lib/utils/filters';
import type { FiltersSchema } from '$lib/utils/filters';

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
		// Campos string opcionales se definen inline
		status: {
			type: 'string',
			queryParam: 'status',
			optional: true
		},
		search: {
			type: 'string',
			queryParam: 'search',
			optional: true
		}
	}
};
```

**Helpers disponibles:**

- `createPageField()` - Campo de paginación
- `createPageSizeField()` - Tamaño de página
- `createBooleanField()` - Campos booleanos
- `createSortField()` - Campo de ordenación
- `createOrderField()` - Dirección de orden (asc/desc)

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

---

### 7.3.1 Tutorial Completo: Crear Vista de Edición

**Objetivo:** Crear desde cero `/backoffice/activities/[slug]/edit` con formulario completo.

Este tutorial cubre **todos los pasos** necesarios: API, tipos, validación y UI.

---

#### **PASO 1: Definir el endpoint en la API**

**1.1 - Añadir configuración del endpoint**

```typescript
// src/lib/api/shared/endpoints.config.ts
export const API_ENDPOINTS = {
	activities: {
		list: {
			path: () => '/activities',
			method: 'GET'
		},
		detail: {
			path: ({ slug }: { slug: string }) => `/activities/${slug}`,
			method: 'GET'
		},
		update: {
			path: ({ slug }: { slug: string }) => `/activities/${slug}`,
			method: 'PUT'
		}
	}
	// ... otros recursos
};
```

**1.2 - Implementar métodos en el endpoint**

```typescript
// src/lib/api/backoffice/endpoints/activities.ts
import { apiClient } from '$lib/api/shared/client';
import { API_ENDPOINTS } from '$lib/api/shared/endpoints.config';
import type { ActivityDetail } from '$lib/types';

export const activitiesEndpoints = {
	async getBySlug(fetchFn: typeof fetch, slug: string): Promise<ActivityDetail> {
		const path = API_ENDPOINTS.activities.detail.path({ slug });
		const response = await apiClient.request<ActivityDetail>(fetchFn, path, {
			method: 'GET'
		});
		return response.data;
	},

	async update(fetchFn: typeof fetch, slug: string, data: Partial<ActivityDetail>) {
		const path = API_ENDPOINTS.activities.update.path({ slug });
		const response = await apiClient.request(fetchFn, path, {
			method: 'PUT',
			body: JSON.stringify(data)
		});
		return response.data;
	}
};
```

**1.3 - Exportar en el índice**

```typescript
// src/lib/api/backoffice/index.ts
import { activitiesEndpoints } from './endpoints/activities';

export const api = {
	activities: activitiesEndpoints
	// ... otros recursos
};
```

---

#### **PASO 2: Definir tipos TypeScript**

```typescript
// src/lib/types.ts
export type ActivityDetail = {
	id: string;
	title: string;
	slug: string;
	codeRef: string;
	descriptionFull: string;
	descriptionShort: string;
	infoImportant: string | null;
	phoneContact: string | null;
	status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
	tags: Array<{ id: string; name: string }>;
	categories: Array<{ id: string; name: string }>;
	attractions: Array<{ id: string; name: string }>;
	destinations: Array<{ id: string; name: string }>;
	// ... más campos según tu API
};

export type ActivityFormData = Omit<ActivityDetail, 'id'>; // Para crear
export type ActivityUpdateData = Partial<ActivityDetail>; // Para actualizar
```

**Relación con validación:**

- Los tipos TypeScript definen la **estructura** de los datos
- Los schemas Zod definen las **reglas de validación**
- Superforms conecta ambos automáticamente

---

#### **PASO 3: Crear schema de validación con Zod**

```typescript
// src/routes/(backoffice)/backoffice/activities/activity-form.schema.ts
import { z } from 'zod';
import {
	ACTIVITY_STATUS_VALUES // Enums generados desde la API
} from '$lib/config/enums';

/**
 * Schema de validación para el formulario de actividades
 * Usado tanto en creación como en edición
 */
export const activityFormSchema = z.object({
	id: z.string(),
	title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(200),
	slug: z.string().min(3, 'El slug debe tener al menos 3 caracteres').max(100),
	codeRef: z.string().min(1, 'El código de referencia es obligatorio'),
	descriptionFull: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
	descriptionShort: z.string().min(10, 'La descripción corta debe tener al menos 10 caracteres'),
	infoImportant: z.string().optional(),
	phoneContact: z.string().optional(),
	status: z.enum(ACTIVITY_STATUS_VALUES), // Validación con enum
	tags: z
		.array(
			z.object({
				id: z.string(),
				name: z.string()
			})
		)
		.default([]),
	categories: z
		.array(
			z.object({
				id: z.string(),
				name: z.string()
			})
		)
		.min(1, 'Debe seleccionar al menos una categoría'), // Validación de array
	attractions: z.array(z.object({ id: z.string(), name: z.string() })).default([]),
	destinations: z.array(z.object({ id: z.string(), name: z.string() })).default([])
});

// Tipo inferido del schema
export type ActivityFormData = z.infer<typeof activityFormSchema>;
```

**Tipos de validaciones útiles:**

```typescript
// String con validaciones
z.string().min(3).max(100).email(); // Email
z.string().url(); // URL
z.string().regex(/^[a-z-]+$/); // Slug

// Números
z.number().min(0).max(100);
z.number().positive();
z.number().int();

// Opcionales
z.string().optional(); // undefined | string
z.string().nullable(); // null | string

// Arrays
z.array(z.string()).min(1).max(10);
z.array(z.object({ id: z.string() }));

// Enums
z.enum(['DRAFT', 'PUBLISHED']);

// Transformaciones
z.string().transform((val) => val.trim().toLowerCase());
```

---

#### **PASO 4: Crear Load Function (servidor)**

```typescript
// src/routes/(backoffice)/backoffice/activities/[slug]/edit/+page.server.ts
import { activityFormSchema } from '../../activity-form.schema';
import { api, ApiError } from '$lib/api/index';
import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { setFlashMessage } from '$lib/server/flashMessages';
import type { PageServerLoad, Actions } from './$types';

// LOAD: Cargar datos existentes
export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		// 1. Cargar datos de la actividad desde la API
		const [activity, availableCategories, availableTags] = await Promise.all([
			api.activities.getBySlug(fetch, params.slug),
			api.categories.getAll(fetch),
			api.tags.getAll(fetch)
		]);

		// 2. Inicializar formulario con los datos existentes
		const form = await superValidate(
			{
				id: activity.id,
				title: activity.title,
				slug: activity.slug,
				codeRef: activity.codeRef,
				descriptionFull: activity.descriptionFull,
				descriptionShort: activity.descriptionShort,
				infoImportant: activity.infoImportant || '',
				phoneContact: activity.phoneContact || '',
				status: activity.status,
				tags: activity.tags || [],
				categories: activity.categories || [],
				attractions: activity.attractions || [],
				destinations: activity.destinations || []
			},
			zod(activityFormSchema)
		);

		// 3. Retornar datos para la UI
		return {
			activity,
			form,
			availableCategories: availableCategories.data || [],
			availableTags
		};
	} catch (err) {
		if (err instanceof ApiError) {
			if (err.type === 'not_found') {
				throw error(404, 'Actividad no encontrada');
			}
			throw error(err.status || 500, err.message);
		}
		throw error(500, 'Error al cargar la actividad');
	}
};

// ACTION: Procesar el submit del formulario
export const actions: Actions = {
	default: async ({ request, params, fetch, cookies }) => {
		// 1. Validar datos del formulario
		const form = await superValidate(request, zod(activityFormSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		// 2. Actualizar en la API
		try {
			await api.activities.update(fetch, params.slug, form.data);

			// 3. Flash message de éxito
			setFlashMessage(cookies, {
				type: 'success',
				message: 'Actividad actualizada correctamente'
			});

			// 4. Redirigir al detalle
			throw redirect(303, `/backoffice/activities/${params.slug}`);
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status || 500, {
					form,
					error: err.message
				});
			}
			return fail(500, { form, error: 'Error al actualizar la actividad' });
		}
	}
};
```

**Flujo de la Load Function:**

1. **Fetch datos** desde la API externa
2. **Inicializar Superforms** con datos existentes
3. **Retornar datos** para renderizar el formulario

**Flujo de la Action:**

1. **Validar** datos del form con Zod
2. **Llamar API** para actualizar
3. **Flash message** + **Redirect** si OK
4. **Retornar errores** si falla

---

#### **PASO 5: Crear componente del formulario**

```svelte
<!-- src/routes/(backoffice)/backoffice/activities/[slug]/edit/+page.svelte -->
<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormInputSlug from '$lib/components/backoffice/forms/FormInputSlug.svelte';
	import FormTextarea from '$lib/components/backoffice/forms/FormTextarea.svelte';
	import FormSelect from '$lib/components/backoffice/forms/FormSelect.svelte';
	import FormTagManager from '$lib/components/backoffice/forms/FormTagManager.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Configurar Superforms
	const { form, errors, enhance, submitting } = superForm(data.form, {
		dataType: 'json',
		resetForm: false
	});

	// Opciones para el select de status
	const statusOptions = [
		{ value: 'DRAFT', label: 'Borrador' },
		{ value: 'PUBLISHED', label: 'Publicado' },
		{ value: 'ARCHIVED', label: 'Archivado' }
	];
</script>

<div class="backoffice-container">
	<h1 class="mb-6 text-3xl font-bold">Editar Actividad</h1>

	<form method="POST" use:enhance class="space-y-6">
		<!-- Input de texto simple -->
		<FormInputText
			id="title"
			label="Título"
			bind:value={$form.title}
			error={$errors.title}
			required
		/>

		<!-- Input con generación automática de slug -->
		<FormInputSlug
			id="slug"
			label="Slug"
			sourceValue={$form.title}
			bind:value={$form.slug}
			error={$errors.slug}
			required
		/>

		<FormInputText
			id="codeRef"
			label="Código de Referencia"
			bind:value={$form.codeRef}
			error={$errors.codeRef}
			required
		/>

		<!-- Textarea con múltiples filas -->
		<FormTextarea
			id="descriptionFull"
			label="Descripción Completa"
			bind:value={$form.descriptionFull}
			error={$errors.descriptionFull}
			rows={8}
			required
		/>

		<FormTextarea
			id="descriptionShort"
			label="Descripción Corta"
			bind:value={$form.descriptionShort}
			error={$errors.descriptionShort}
			rows={4}
			required
		/>

		<FormTextarea
			id="infoImportant"
			label="Información Importante"
			bind:value={$form.infoImportant}
			error={$errors.infoImportant}
			rows={4}
		/>

		<!-- Select dropdown -->
		<FormSelect
			id="status"
			label="Estado"
			bind:value={$form.status}
			error={$errors.status}
			options={statusOptions}
			required
		/>

		<!-- Tag manager con autocompletado -->
		<FormTagManager
			id="tags"
			label="Tags"
			bind:value={$form.tags}
			availableTags={data.availableTags}
			error={$errors.tags}
		/>

		<FormTagManager
			id="categories"
			label="Categorías"
			bind:value={$form.categories}
			availableTags={data.availableCategories}
			error={$errors.categories}
			required
		/>

		<!-- Error general del formulario -->
		{#if data.error}
			<div class="alert alert-error">
				<span>{data.error}</span>
			</div>
		{/if}

		<!-- Botones de acción -->
		<div class="flex gap-4">
			<button type="submit" class="btn btn-primary" disabled={$submitting}>
				{$submitting ? 'Guardando...' : 'Guardar Cambios'}
			</button>

			<a href="/backoffice/activities/{data.activity.slug}" class="btn btn-ghost"> Cancelar </a>
		</div>
	</form>
</div>
```

**Conectando validación con errores en UI:**

1. **Zod valida** en el servidor (`+page.server.ts`)
2. **Superforms propaga** errores a `$errors`
3. **Componentes muestran** errores si existen:

```svelte
<FormInputText id="title" bind:value={$form.title} error={$errors.title} ← Error de Zod aquí />
```

Si Zod falla en `z.string().min(3)`, `$errors.title` contendrá:

```
['El título debe tener al menos 3 caracteres']
```

Y el componente lo mostrará automáticamente debajo del input.

---

#### **PASO 6: Probar y debuggear**

**6.1 - Iniciar el servidor:**

```bash
npm run dev
```

**6.2 - Navegar a:**

```
http://localhost:5173/backoffice/activities/lisbon-food-tour/edit
```

**6.3 - Debugging común:**

```svelte
<!-- Ver estado actual del formulario -->
<script>
	$effect(() => {
		console.log('Form data:', $form);
		console.log('Errors:', $errors);
		console.log('Submitting:', $submitting);
	});
</script>
```

**6.4 - Verificar en DevTools:**

- **Network tab:** Ver requests a la API
- **Console:** Ver logs de validación
- **Svelte DevTools:** Inspeccionar estado de componentes

---

#### **Resumen del Flujo Completo**

```
1. Usuario carga /backoffice/activities/[slug]/edit
   ↓
2. Load Function ejecuta en servidor:
   - api.activities.getBySlug() → fetch datos de API externa
   - superValidate() → inicializa form con datos
   ↓
3. +page.svelte renderiza:
   - Formulario con datos pre-cargados
   - Inputs conectados a $form
   - Errores conectados a $errors
   ↓
4. Usuario edita y hace submit
   ↓
5. Action ejecuta en servidor:
   - superValidate() → valida con Zod
   - Si inválido → return fail(400, { form })
   - Si válido → api.activities.update()
   ↓
6. Si OK:
   - setFlashMessage('success')
   - redirect(303, '/backoffice/activities/[slug]')
   ↓
7. Si error:
   - return fail(500, { form, error })
   - UI muestra errores automáticamente
```

---

#### **Checklist de Implementación**

- [ ] **API Endpoint** configurado en `endpoints.config.ts`
- [ ] **Método implementado** en `endpoints/[resource].ts`
- [ ] **Tipo TypeScript** definido en `$lib/types.ts`
- [ ] **Schema Zod** creado en `[resource]-form.schema.ts`
- [ ] **Load Function** implementada en `+page.server.ts`
- [ ] **Action** implementada en `+page.server.ts`
- [ ] **Componente** creado en `+page.svelte`
- [ ] **Formulario conectado** con `superForm()`
- [ ] **Componentes de form** importados correctamente
- [ ] **Errores mostrados** en cada campo
- [ ] **Flash messages** configurados
- [ ] **Redirect** después de éxito
- [ ] **Probado** en navegador

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

# Storybook (desarrollo de componentes)
npm run storybook        # Servidor de Storybook (port 6006)
npm run build-storybook  # Build estático de Storybook
```

**Workflow recomendado antes de commit:**

```bash
npm run format && npm run lint && npm run check
```

**Storybook para desarrollo de componentes:**

Storybook permite desarrollar y probar componentes de forma aislada:

```bash
# Iniciar Storybook
npm run storybook

# Se abre en http://localhost:6006
```

- ✅ Visualiza componentes sin necesidad de crear páginas
- ✅ Prueba diferentes estados y props
- ✅ Documentación viva de componentes
- ✅ Testing visual automático
- ✅ Configuración en `.storybook-marketplace/`

---

## PARTE 8: HANDS-ON PRÁCTICA (10 min)

### 8.1 Ejercicio guiado: Crear una página simple

**Objetivo:** Crear una página que muestre una lista de tags desde la API.

**Paso 1: Crear la ruta**

```bash
# Crear carpeta (nota: la ruta real tiene doble backoffice/)
mkdir -p src/routes/(backoffice)/backoffice/tags

# Crear archivos
touch src/routes/(backoffice)/backoffice/tags/+page.svelte
touch src/routes/(backoffice)/backoffice/tags/+page.server.ts
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
	import Tag from '$lib/components/backoffice/Tag.svelte';

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

# Abrir http://localhost:5173/backoffice/tags
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
