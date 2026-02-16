# Sveltekit PoC

Prueba de concepto de Sveltekit con Typescript, Tailwind y DaisyUI de cara a desarrollar un front para una API REST.

Arrancar el server: `npm run dev -- --open`

## Tech stack

- **Framework**: SvelteKit (v5, runes)
- **Language**: TypeScript
- **Styling**:
  - Tailwind CSS v4
  - DaisyUI (backoffice)
  - @tailwindcss/forms
  - @tailwindcss/typography
- **State management**:
  - Svelte runes ($state, $props)
- **API**:
  - REST API (external)
  - API Client centralizado con retry, timeout y error handling
- **Forms & Validation**:
  - SvelteKit Superforms
  - Zod (schema validation)
- **UI Components**:
  - Melt UI (headless components)
  - Svelte Iconoir (icons)
- **Other libraries**:
  - PhotoSwipe (image gallery)
  - Swiper (carousels)
  - @internationalized/date (date handling)

## Configuracion del entorno de desarrollo

### Requisitos previos

- Node.js (v18+)
- Git (v2.34+ recomendado, necesario para firma de commits)
- GPG o SSH configurado para firma de commits

### Instalacion

```bash
git clone <repo-url>
cd buendia-frontend-core
npm install
```

Al ejecutar `npm install`, Husky se configura automaticamente gracias al script `prepare` del `package.json`. Los git hooks quedaran activos sin pasos adicionales.

### Git hooks automáticos

El proyecto usa **Husky** + **lint-staged** + **commitlint** para garantizar la calidad del codigo en cada commit.

| Hook         | Que hace                                                                        |
| ------------ | ------------------------------------------------------------------------------- |
| `pre-commit` | Ejecuta Prettier y ESLint (con autofix) sobre los archivos staged               |
| `commit-msg` | Valida que el mensaje siga Conventional Commits y que la firma este configurada |

Esto significa que:

- No puedes hacer commit de codigo sin formatear o con errores de lint.
- No puedes hacer commit con mensajes que no sigan el formato convencional.
- No puedes hacer commit sin tener la firma configurada.

### Conventional Commits

Todos los mensajes de commit deben seguir el formato [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(alcance opcional): descripcion
```

**Tipos permitidos:**

| Tipo       | Cuando usarlo                                              |
| ---------- | ---------------------------------------------------------- |
| `feat`     | Nueva funcionalidad                                        |
| `fix`      | Correccion de bug                                          |
| `docs`     | Cambios en documentacion                                   |
| `style`    | Formateo, punto y coma, etc. (sin cambio de logica)        |
| `refactor` | Refactorizacion de codigo (sin nueva funcionalidad ni fix) |
| `perf`     | Mejora de rendimiento                                      |
| `test`     | Anadir o corregir tests                                    |
| `build`    | Cambios en el sistema de build o dependencias              |
| `ci`       | Cambios en configuracion de CI/CD                          |
| `chore`    | Tareas de mantenimiento                                    |
| `revert`   | Revertir un commit anterior                                |

**Ejemplos:**

```bash
git commit -m "feat: add search filter to activities list"
git commit -m "fix(auth): resolve token refresh loop"
git commit -m "docs: update README with commit conventions"
git commit -m "refactor(api): simplify error handling in client"
```

### Firma de commits (GPG)

Los commits deben ir firmados. A continuacion se explica como configurarlo en cada sistema operativo. La configuracion es **local al proyecto** (no global).

#### macOS

```bash
# 1. Instalar GPG
brew install gnupg

# 2. Generar una clave GPG
gpg --full-generate-key
# Selecciona: RSA and RSA, 4096 bits, tu nombre y email del proyecto

# 3. Obtener el ID de tu clave
gpg --list-secret-keys --keyid-format=long
# Busca la linea:  sec   rsa4096/XXXXXXXXXXXXXXXX
# XXXXXXXXXXXXXXXX es tu KEY_ID

# 4. Configurar Git (solo este proyecto)
git config --local user.signingkey XXXXXXXXXXXXXXXX
git config --local commit.gpgsign true

# 5. (Opcional) Si GPG pide passphrase en terminal, instalar pinentry-mac
brew install pinentry-mac
echo "pinentry-program $(which pinentry-mac)" >> ~/.gnupg/gpg-agent.conf
gpgconf --kill gpg-agent
```

#### Linux (Ubuntu/Debian)

```bash
# 1. Instalar GPG (normalmente ya viene instalado)
sudo apt update && sudo apt install gnupg

# 2. Generar una clave GPG
gpg --full-generate-key

# 3. Obtener el ID de tu clave
gpg --list-secret-keys --keyid-format=long

# 4. Configurar Git (solo este proyecto)
git config --local user.signingkey XXXXXXXXXXXXXXXX
git config --local commit.gpgsign true

# 5. Configurar GPG para terminal (si da error de pinentry)
export GPG_TTY=$(tty)
# Anade la linea anterior a tu ~/.bashrc o ~/.zshrc para que sea permanente
```

#### Windows

```powershell
# 1. Instalar GPG (descargar Gpg4win de https://www.gpg4win.org/)
# O con winget:
winget install GnuPG.Gpg4win

# 2. Abrir una terminal (Git Bash, PowerShell o CMD) y generar clave
gpg --full-generate-key

# 3. Obtener el ID de tu clave
gpg --list-secret-keys --keyid-format=long

# 4. Configurar Git (solo este proyecto)
git config --local user.signingkey XXXXXXXXXXXXXXXX
git config --local commit.gpgsign true

# 5. Indicar a Git donde esta GPG (si no lo detecta automaticamente)
# En Git Bash:
git config --local gpg.program "C:/Program Files (x86)/GnuPG/bin/gpg.exe"
# Ajusta la ruta segun tu instalacion de Gpg4win
```

#### Alternativa: Firma con SSH (todos los sistemas)

Si prefieres usar tu clave SSH existente en vez de GPG:

```bash
# 1. Configurar Git para usar SSH como formato de firma
git config --local gpg.format ssh
git config --local user.signingkey ~/.ssh/id_ed25519  # o tu clave SSH

# 2. Activar firma
git config --local commit.gpgsign true
```

#### Subir tu clave publica a GitHub

Para que GitHub muestre el badge "Verified" en tus commits:

1. Exporta tu clave publica:
   - **GPG:** `gpg --armor --export XXXXXXXXXXXXXXXX`
   - **SSH:** `cat ~/.ssh/id_ed25519.pub`
2. Ve a GitHub > Settings > SSH and GPG keys.
3. Anade la clave como **Signing Key** (GPG o SSH segun corresponda).

#### Verificar que funciona

```bash
# Intenta hacer un commit de prueba
git commit --allow-empty -m "test: verify commit signing"

# Verifica que esta firmado
git log --show-signature -1
```

### Lint y formato automatico en el editor (Zed)

El proyecto incluye configuracion compartida en `.zed/settings.json`. Al abrir el proyecto en Zed:

- **Format on save** — Prettier formatea automaticamente al guardar
- **ESLint autofix on save** — Corrige errores de lint al guardar en archivos `.js`, `.ts` y `.svelte`
- **ESLint en tiempo real** — Muestra errores mientras escribes

No necesitas configurar nada adicional en Zed, la configuracion del proyecto se aplica automaticamente.

### Comandos utiles

```bash
npm run dev              # Servidor de desarrollo (http://localhost:5173)
npm run build            # Build de produccion
npm run preview          # Preview del build de produccion
npm run check            # Type-check (svelte-kit sync + svelte-check)
npm run lint             # Verificar formato (Prettier) y lint (ESLint)
npm run format           # Auto-formatear todo el proyecto con Prettier
```

---

## Sistema de API Client

Este proyecto utiliza un **cliente de API centralizado** en `src/lib/api/` para todas las llamadas a la API externa.

### Características

- ✅ **Retry automático** con exponential backoff (3 intentos por defecto)
- ✅ **Timeout configurable** (30 segundos por defecto)
- ✅ **Error handling tipado** con clases de error específicas
- ✅ **Logging en desarrollo** para debugging
- ✅ **Endpoints type-safe** con TypeScript
- ✅ **Configuración centralizada** de rutas y comportamiento

### Estructura

```
src/lib/api/
├── config.ts              # Configuración general (timeouts, retries, headers)
├── endpoints.config.ts    # Definición de todas las rutas de API
├── types.ts               # Tipos para errores, requests y responses
├── errors.ts              # Clases de error personalizadas
├── client.ts              # Cliente HTTP con retry y timeout
├── endpoints/
│   ├── activities.ts      # Endpoints de activities
│   ├── locations.ts       # Endpoints de locations
│   ├── categories.ts      # Endpoints de categories
│   └── tags.ts            # Endpoints de tags
└── index.ts               # Export centralizado
```

### Uso básico

```typescript
// En cualquier +page.server.ts
import { api, ApiError } from '$lib/api/index';

export const load = async ({ fetch }) => {
	try {
		// Llamada type-safe a la API
		const activities = await api.activities.getAll(fetch, {
			page: 1,
			pageSize: 10
		});

		return { activities };
	} catch (err) {
		if (err instanceof ApiError) {
			// Error handling tipado
			console.error(err.type, err.message, err.status);
		}
		throw error(500, 'Error al cargar actividades');
	}
};
```

### Configurar rutas de API

Todas las rutas están centralizadas en `src/lib/api/endpoints.config.ts`:

```typescript
export const BASE_PATHS = {
	activities: '/activities',
	locations: '/locations'
	// ... agregar más aquí
};

export const ACTIVITIES_ENDPOINTS = {
	list: () => BASE_PATHS.activities,
	detail: (slug: string) => `${BASE_PATHS.activities}/${slug}`
	// ... más endpoints
};
```

Para cambiar una ruta base, solo modifica `BASE_PATHS`. Para agregar un endpoint nuevo:

```typescript
export const ACTIVITIES_ENDPOINTS = {
	// ... endpoints existentes

	/** POST /activities/:slug/publish */
	publish: (slug: string) => `${BASE_PATHS.activities}/${slug}/publish`
};
```

### Configuración avanzada

Ajusta timeouts, retries y headers en `src/lib/api/config.ts`:

```typescript
export const apiConfig = {
	baseURL: PUBLIC_API_BASE_URL,
	timeout: 30000, // 30 segundos
	retry: {
		attempts: 3, // 3 reintentos
		delay: 1000, // 1 segundo inicial
		backoff: 2, // Exponencial
		retryOn: [408, 429, 500, 502, 503, 504]
	},
	headers: {
		'Content-Type': 'application/json',
		'X-App-Version': '1.0.0'
	},
	debug: import.meta.env.DEV // Logs en desarrollo
};
```

### Tipos de errores

El cliente distingue diferentes tipos de errores:

```typescript
type ApiErrorType =
  | 'network'          // Error de red
  | 'timeout'          // Timeout
  | 'not_found'        // 404
  | 'unauthorized'     // 401
  | 'forbidden'        // 403
  | 'validation'       // 422
  | 'server_error'     // 500+
  | 'unknown';

// Ejemplo de uso
catch (err) {
  if (err instanceof ApiError) {
    switch (err.type) {
      case 'not_found':
        // Manejar 404
        break;
      case 'server_error':
        // Manejar error del servidor
        break;
    }
  }
}
```

### Agregar nuevos endpoints

1. **Definir la ruta** en `endpoints.config.ts`
2. **Crear el módulo** en `endpoints/tu-recurso.ts`
3. **Exportar** desde `index.ts`

Ejemplo completo:

```typescript
// 1. endpoints.config.ts
export const BASE_PATHS = {
	// ...
	bookings: '/bookings'
};

export const BOOKINGS_ENDPOINTS = {
	list: () => BASE_PATHS.bookings,
	detail: (id: string) => `${BASE_PATHS.bookings}/${id}`
};

// 2. endpoints/bookings.ts
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints.config';

export const bookingsEndpoints = {
	async getAll(fetchFn: typeof fetch) {
		const response = await apiClient.request(fetchFn, API_ENDPOINTS.bookings.list(), {
			method: 'GET'
		});
		return response.data;
	}
};

// 3. index.ts
import { bookingsEndpoints } from './endpoints/bookings';

export const api = {
	// ...
	bookings: bookingsEndpoints
};
```

## Cómo añadir campos a un formulario

Este proyecto usa **SvelteKit Superforms + Zod** para manejo de formularios con validación. Para añadir un nuevo campo a un formulario existente (ej: activities), debes modificar **3 archivos**:

### 1. Schema de validación (`activity-form.schema.ts`)

Define el campo y sus reglas de validación con Zod:

```typescript
// src/routes/(app)/activities/activity-form.schema.ts
export const activityFormSchema = z.object({
	title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(200),
	slug: z.string().min(3, 'El slug debe tener al menos 3 caracteres').max(200),
	// ⬇️ Añadir nuevo campo aquí
	newField: z.string().min(1, 'Campo requerido')
	// ...resto de campos
});
```

**Tipos de validación comunes:**

- `z.string()` - Texto
- `z.number()` - Número
- `z.boolean()` - Booleano
- `z.enum(['EUR', 'USD'])` - Opciones limitadas
- `.optional()` - Campo opcional
- `.min()`, `.max()` - Longitud/valor mínimo/máximo

### 2. Server load y actions (`+page.server.ts`)

Mapea el campo desde/hacia la API:

```typescript
// src/routes/(app)/activities/[slug]/edit/+page.server.ts

// En la función load (mapeo API → formulario)
const form = await superValidate(
	{
		title: apiData.main?.title || '',
		slug: apiData.slug || '',
		newField: apiData.newField || '' // ⬅️ Añadir aquí
		// ...resto de campos
	},
	zod(activityFormSchema)
);

// En las actions (mapeo formulario → API)
body: JSON.stringify({
	title: form.data.title,
	slug: form.data.slug,
	newField: form.data.newField // ⬅️ Añadir aquí
	// ...resto de campos
});
```

### 3. Vista del formulario (`+page.svelte`)

Renderiza el campo en el HTML:

```svelte
<!-- src/routes/(app)/activities/[slug]/edit/+page.svelte -->

<div class="md:col-span-12">
	<label class="label text-sm" for="newField">Nuevo Campo</label>
	<input
		type="text"
		id="newField"
		name="newField"
		class="input w-full"
		class:input-error={$errors.newField}
		bind:value={$form.newField}
	/>
	{#if $errors.newField}
		<span class="text-error text-sm">{$errors.newField}</span>
	{/if}
</div>
```

**Tipos de campos HTML:**

- `<input type="text">` - Texto simple
- `<textarea>` - Texto largo (sin atributo `type`)
- `<input type="number">` - Números
- `<input type="checkbox" bind:checked={$form.field}>` - Checkbox
- `<select>` - Dropdown
- `<input readonly>` - Solo lectura (con patrón cebrado)

### Flujo completo

```
1. Usuario edita campo en UI
   ↓
2. Svelte actualiza $form.newField (bind:value)
   ↓
3. Usuario envía formulario
   ↓
4. Superforms valida con Zod schema
   ↓
5. Si válido: +page.server.ts envía a API
   ↓
6. API responde → redirección o error
```

### Notas importantes

- ✅ El **schema de Zod** es la fuente de verdad para tipos TypeScript
- ✅ **Superforms** maneja automáticamente: validación, errores, estado del form
- ✅ Los campos `readonly` tienen estilo especial (franjas cebradas)
- ✅ Usa `bind:value` para inputs/textarea/select
- ✅ Usa `bind:checked` para checkboxes
- ⚠️ Los `<textarea>` NO tienen atributo `type`
- ⚠️ Cierra `<textarea>` con `></textarea>`, no con `/>`

## Cosas a explicar en la documentación

- Tailwind
- DaisyUI
- Bit UI
- Componentes y nomenclatura `b-`
- Rutas
- Contextos? `(app)`
- Layouts
- Iconos
- Assets

## Internacionalización

La internacionalización oficial se hace con Paraglide

- https://svelte.dev/docs/cli/paraglide
- https://inlang.com/m/gerre34r/library-inlang-paraglideJs/sveltekit/

## Organización de Estilos CSS

Este proyecto utiliza tres enfoques para los estilos CSS:

### 1. **Estilos con ámbito (Scoped Styles)**

Cada componente `.svelte` puede incluir su propio bloque `<style>` que solo afecta a ese componente. Ideal para estilos específicos que no se reutilizan.

```svelte
<div class="card">Contenido</div>

<style>
	.card {
		padding: 1rem;
	}
</style>
```

### 2. **Estilos globales base** (`src/routes/layout.css`)

Contiene la configuración de Tailwind CSS y sus plugins (DaisyUI, forms, typography). Se importa en el layout raíz y está disponible en toda la aplicación.

```css
@import 'tailwindcss';
@plugin '@tailwindcss/forms';
@plugin '@tailwindcss/typography';
@plugin 'daisyui';
```

### 3. **Estilos personalizados reutilizables** (`src/lib/styles/`)

Para componentes CSS personalizados, clases de utilidad adicionales o librerías externas que no están en Tailwind/DaisyUI. Se organizan en:

- `variables.css` - Variables CSS (colores, espaciados, etc.)
- `custom.css` - Clases personalizadas reutilizables

Estos archivos se importan en `src/routes/+layout.svelte` para estar disponibles globalmente.

### 4. Iconos

https://github.com/metonym/svelte-iconoir

## Sistema de Filtros URL-Driven

Este proyecto implementa un sistema de filtros donde **la URL es la fuente de verdad**. Los filtros, paginación y ordenación viven en los query params de la URL, lo que garantiza:

- ✅ **SSR compatible** - Los filtros se parsean en el servidor
- ✅ **Back/Forward del navegador** - Funcionan correctamente
- ✅ **URLs compartibles** - Cada estado es una URL única
- ✅ **Motor genérico reutilizable** - Un schema por vista, lógica compartida

### Arquitectura del sistema

```
URL (?from=...&to=...&location=...)
  ↓
+page.server.ts (parseFilters)
  ↓
API externa
  ↓
+page.svelte (UI refleja URL)
  ↓
Usuario cambia filtro
  ↓
patchFilters() → goto()
  ↓
URL actualizada → ciclo se repite
```

### Cómo añadir filtros en una nueva vista

#### Paso 1: Crear el schema de filtros

Crea el archivo del schema en `src/lib/features/[nombre-vista]/filters.schema.ts`:

```typescript
// src/lib/features/destinations/filters.schema.ts
import type { FiltersSchema } from '$lib/utils/filters';

export type DestinationsFilters = {
	page: number;
	pageSize: number;
	country?: string;
	minPrice?: number;
	maxPrice?: number;
};

export const destinationsFiltersSchema: FiltersSchema<DestinationsFilters> = {
	fields: {
		page: {
			parse: (raw) => {
				const num = parseInt(raw || '1', 10);
				return num > 0 ? num : 1;
			},
			serialize: (value, out) => {
				out.set('page', String(value ?? 1));
			},
			resetPageOnChange: false
		},
		pageSize: {
			parse: (raw) => {
				const num = parseInt(raw || '10', 10);
				return num > 0 ? num : 10;
			},
			serialize: (value, out) => {
				out.set('pageSize', String(value ?? 10));
			},
			resetPageOnChange: false
		},
		country: {
			parse: (raw) => raw || undefined,
			serialize: (value, out) => {
				if (value) {
					out.set('country', value);
				} else {
					out.delete('country');
				}
			},
			resetPageOnChange: true // Cambiar país resetea a página 1
		},
		minPrice: {
			parse: (raw) => {
				const num = parseFloat(raw || '');
				return !isNaN(num) && num >= 0 ? num : undefined;
			},
			serialize: (value, out) => {
				if (value !== undefined) {
					out.set('minPrice', String(value));
				} else {
					out.delete('minPrice');
				}
			},
			resetPageOnChange: true
		},
		maxPrice: {
			parse: (raw) => {
				const num = parseFloat(raw || '');
				return !isNaN(num) && num >= 0 ? num : undefined;
			},
			serialize: (value, out) => {
				if (value !== undefined) {
					out.set('maxPrice', String(value));
				} else {
					out.delete('maxPrice');
				}
			},
			resetPageOnChange: true
		}
	}
};
```

**Conceptos clave del schema:**

- **`parse`**: Convierte string de URL → tipo TypeScript
- **`serialize`**: Convierte tipo TypeScript → string de URL
- **`resetPageOnChange: true`**: Cuando este filtro cambia, resetea `page=1`
- **`resetPageOnChange: false`**: Para `page` y `pageSize` (no se resetean a sí mismos)

#### Paso 2: Conectar el servidor (+page.server.ts)

```typescript
// src/routes/(app)/destinations/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { parseFilters } from '$lib/utils/filters';
import { destinationsFiltersSchema } from '$lib/features/destinations/filters.schema';

export const load: PageServerLoad = async ({ fetch, url }) => {
	// 1. Parsear filtros desde URL
	const filters = parseFilters(destinationsFiltersSchema, url.searchParams);

	// 2. Construir URL a API externa
	const apiUrl = new URL(`${PUBLIC_API_BASE_URL}/destinations`);

	// Siempre incluir page y pageSize
	apiUrl.searchParams.set('page', String(filters.page));
	apiUrl.searchParams.set('pageSize', String(filters.pageSize));

	// Incluir filtros opcionales solo si existen
	if (filters.country) {
		apiUrl.searchParams.set('country', filters.country);
	}

	if (filters.minPrice !== undefined) {
		apiUrl.searchParams.set('minPrice', String(filters.minPrice));
	}

	if (filters.maxPrice !== undefined) {
		apiUrl.searchParams.set('maxPrice', String(filters.maxPrice));
	}

	// 3. Fetch desde API
	try {
		const res = await fetch(apiUrl);
		if (!res.ok) throw error(res.status, 'Error al cargar destinos');

		const data = await res.json();

		// 4. Devolver datos + filters para inicializar UI
		return {
			items: data.items,
			pagination: data.pagination,
			filters // ← Importante: devolver filters parseados
		};
	} catch (err) {
		throw error(503, 'No se pudo conectar con el servidor');
	}
};
```

#### Paso 3: Conectar el cliente (+page.svelte)

```svelte
<script lang="ts">
	import type { DestinationsFilters } from '$lib/features/destinations/filters.schema';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { patchFilters } from '$lib/utils/filters';
	import { destinationsFiltersSchema } from '$lib/features/destinations/filters.schema';

	// 1. Recibir data del servidor (incluyendo filters)
	let { data } = $props();

	const items = $derived(data.items);
	const pagination = $derived(data.pagination);
	const filters = $derived(data.filters);

	// 2. Función helper para aplicar cambios de filtros
	function applyFilterPatch(patch: Partial<DestinationsFilters>) {
		const currentParams = $page.url.searchParams;
		const newParams = patchFilters(destinationsFiltersSchema, currentParams, patch);
		goto(`?${newParams.toString()}`, {
			replaceState: true, // No llenar historial
			noScroll: true, // Mantener scroll
			keepFocus: true // Mantener foco
		});
	}

	// 3. Estados locales sincronizados con URL
	let selectedCountry = $state(filters.country);
	let minPriceValue = $state(filters.minPrice);
	let maxPriceValue = $state(filters.maxPrice);

	// Sincronizar con cambios de URL (back/forward)
	$effect(() => {
		selectedCountry = filters.country;
		minPriceValue = filters.minPrice;
		maxPriceValue = filters.maxPrice;
	});

	// 4. Handlers para cada filtro
	function handleCountryChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		const value = target.value || undefined;
		selectedCountry = value;

		applyFilterPatch({ country: value });
	}

	function handlePriceChange() {
		applyFilterPatch({
			minPrice: minPriceValue,
			maxPrice: maxPriceValue
		});
	}

	// 5. Handler de paginación (conserva filtros automáticamente)
	function handlePageChange(newPage: number) {
		applyFilterPatch({ page: newPage });
	}
</script>

<!-- UI -->
<div class="filters">
	<select bind:value={selectedCountry} onchange={handleCountryChange}>
		<option value="">Todos los países</option>
		<option value="spain">España</option>
		<option value="france">Francia</option>
	</select>

	<input
		type="number"
		bind:value={minPriceValue}
		onchange={handlePriceChange}
		placeholder="Precio mín."
	/>

	<input
		type="number"
		bind:value={maxPriceValue}
		onchange={handlePriceChange}
		placeholder="Precio máx."
	/>
</div>

<!-- Lista de items -->
{#each items as item}
	<div>{item.name}</div>
{/each}

<!-- Paginación -->
<Pagination
	count={pagination.total}
	perPage={pagination.pageSize}
	onPageChange={handlePageChange}
/>
```

#### Paso 4: Patrones comunes

**Filtro de fecha (YYYY-MM-DD):**

```typescript
from: {
  parse: (raw) => {
    if (!raw) return undefined;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return undefined;
    return raw;
  },
  serialize: (value, out) => {
    if (value) out.set('from', value);
    else out.delete('from');
  },
  resetPageOnChange: true
}
```

**Filtro booleano (presence-based):**

```typescript
featured: {
  parse: (raw) => raw !== null ? true : undefined,
  serialize: (value, out) => {
    if (value === true) out.set('featured', '1');
    else out.delete('featured');
  },
  resetPageOnChange: true
}
```

**Filtro de array (múltiples valores):**

```typescript
tags: {
  parse: (raw) => {
    if (!raw) return undefined;
    return raw.split(',').filter(Boolean);
  },
  serialize: (value, out) => {
    if (value && value.length > 0) {
      out.set('tags', value.join(','));
    } else {
      out.delete('tags');
    }
  },
  resetPageOnChange: true
}
```

### Checklist de validación

Después de implementar filtros en una nueva vista, verifica:

- [ ] **URL sin filtros** (`/vista?page=1&pageSize=10`) carga normal
- [ ] **URL con filtros** carga ya filtrado (SSR)
- [ ] **UI refleja filtros** de la URL al cargar
- [ ] **Cambiar filtro** actualiza la URL
- [ ] **Cambiar filtro** resetea `page=1` (si `resetPageOnChange: true`)
- [ ] **Cambiar página** conserva filtros en URL
- [ ] **Back/Forward** restaura filtros y UI correctamente
- [ ] **URLs compartibles** funcionan al copiar/pegar

### Ventajas del enfoque

1. **No hay estado duplicado** - La URL es la única fuente de verdad
2. **SSR funciona** - Los filtros se parsean en el servidor
3. **Escalable** - Añadir nuevas vistas es copiar el patrón
4. **Type-safe** - TypeScript en todo el flujo
5. **Testeable** - Parsers y serializers son funciones puras

### Ejemplo real: Activities

Ver implementación completa en:

- Schema: `src/lib/features/activities/filters.schema.ts`
- Servidor: `src/routes/(app)/activities/+page.server.ts`
- Cliente: `src/routes/(app)/activities/+page.svelte`
