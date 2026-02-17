# Arquitectura: Server Action Factories

Sistema de factories reutilizables para operaciones CRUD en SvelteKit, eliminando código repetitivo y estandarizando el manejo de errores, validación y flash messages.

## Visión general

El proyecto implementa un patrón de **factory functions** para las operaciones CRUD (Create, Read, Update, Delete) que:

- ✅ Eliminan código duplicado entre entidades (activities, destinations, attractions)
- ✅ Estandarizan el manejo de errores con mensajes personalizados
- ✅ Implementan flash messages consistentes (cookies + alert inmediato)
- ✅ Generan UUIDs en servidor para seguridad
- ✅ Simplifican la creación de nuevos recursos

## Factories disponibles

### 1. `createCreateLoad()` - Load para páginas de creación

**Ubicación:** `src/lib/server/createLoad.ts`

**Responsabilidades:**

- Generar UUID único en servidor (seguridad)
- Cargar listas disponibles (tags, categories, destinations, etc.)
- Inicializar formulario con valores por defecto
- Generar breadcrumbs
- Manejo consistente de errores

**Ejemplo de uso:**

```typescript
// src/routes/(backoffice)/activities/create/+page.server.ts
import { createCreateLoad } from '$lib/server/createLoad';
import { activityFormSchema } from '../activity-form.schema';
import { api } from '$lib/api/index';
import { zod } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = createCreateLoad({
	schema: zod(activityFormSchema),
	initialValues: {
		title: '',
		slug: '',
		status: 'DRAFT',
		categories: [],
		tags: []
	},
	loadAvailableData: async (fetch) => ({
		availableTags: await fetch(`${apiConfig.baseURL}/tags`).then((r) => r.json()),
		availableCategories: await api.categories.getAll(fetch)
	}),
	breadcrumbLabel: 'Nueva actividad',
	entityName: 'actividad'
});
```

**Configuración:**

```typescript
interface CreateLoadConfig {
	schema: any; // Schema de validación (Zod)
	initialValues: Record<string, any>; // Valores iniciales (sin UUID)
	loadAvailableData?: (fetch) => Promise<Record<string, any>>; // Opcional
	breadcrumbLabel: string; // Para breadcrumbs
	entityName: string; // Para mensajes de error
}
```

**Retorna:**

```typescript
{
  form: SuperValidated,           // Formulario inicializado con UUID
  ...availableData,               // Listas disponibles (si se proporcionan)
  breadcrumbs: Breadcrumb[]       // Breadcrumbs generados
}
```

---

### 2. `createCreateAction()` - Action para crear recursos

**Ubicación:** `src/lib/server/createAction.ts`

**Responsabilidades:**

- Validar formulario con schema
- Llamar a la API para crear el recurso
- Manejo de errores con mensajes personalizados por código HTTP
- Flash messages (cookies + alert inmediato)
- Redirección automática a página de edición o detalle

**Ejemplo de uso:**

```typescript
// src/routes/(backoffice)/activities/create/+page.server.ts
import { createCreateAction } from '$lib/server/createAction';

export const actions: Actions = {
	default: createCreateAction({
		basePath: '/activities',
		schema: zod(activityFormSchema),
		createFn: api.activities.create,
		entityName: 'actividad',
		redirectToEdit: true
	})
};
```

**Configuración:**

```typescript
interface CreateActionConfig {
	basePath: string; // Ruta base (ej: '/activities')
	schema: any; // Schema de validación (Zod)
	createFn: (fetch, data) => Promise<any>; // Función de creación
	entityName: string; // Para mensajes (ej: 'actividad')
	transformData?: (data) => any; // Transformación opcional
	redirectToEdit?: boolean; // true = /edit, false = /detalle
}
```

**Manejo de errores HTTP:**

| Código | Mensaje                                              |
| ------ | ---------------------------------------------------- |
| 400    | Los datos enviados no son válidos                    |
| 401    | Debes iniciar sesión para crear {entityName}s        |
| 403    | No tienes permisos para crear {entityName}s          |
| 404    | Endpoint de creación no encontrado en la API         |
| 409    | Ya existe un/una {entityName} con este slug          |
| 422    | Los datos no cumplen con los requisitos del servidor |
| 500    | Error del servidor. Por favor, inténtalo más tarde   |
| 503    | El servicio no está disponible                       |

**Flash messages:**

- **Cookies:** Para mostrar después de redirect
- **Alert inmediato:** Incluido en `fail()` para mostrar sin recargar

```typescript
return fail(400, {
	form,
	alert: {
		type: 'error',
		message: errorMessage
	}
});
```

---

### 3. `createUpdateAction()` - Action para actualizar recursos

**Ubicación:** `src/lib/server/updateAction.ts`

**Responsabilidades:**

- Validar formulario
- Actualizar recurso en la API
- Manejo de errores consistente
- Flash messages
- Redirección automática

**Ejemplo de uso:**

```typescript
// src/routes/(backoffice)/activities/[slug]/edit/+page.server.ts
import { createUpdateAction } from '$lib/server/updateAction';

export const actions: Actions = {
	default: createUpdateAction({
		basePath: '/activities',
		schema: zod(activityFormSchema),
		updateFn: api.activities.update,
		redirectToEdit: true
	})
};
```

**Configuración:**

```typescript
interface UpdateActionConfig {
	basePath: string; // Ruta base
	schema: any; // Schema de validación
	updateFn: (fetch, slug, data) => Promise<any>; // Función de actualización
	transformData?: (data) => any; // Transformación opcional
	redirectToEdit?: boolean; // true = /edit, false = /detalle
}
```

---

### 4. `createDeleteAction()` - Action para eliminar recursos

**Ubicación:** `src/lib/server/deleteAction.ts`

**Responsabilidades:**

- Eliminar recurso en la API
- Manejo de errores (incluyendo 409 para dependencias)
- Flash messages
- Redirección al listado con filtros preservados

**Ejemplo de uso:**

```typescript
// src/routes/(backoffice)/activities/[slug]/delete/+page.server.ts
import { createDeleteAction } from '$lib/server/deleteAction';

export const actions: Actions = {
	default: createDeleteAction({
		basePath: '/activities',
		deleteFn: api.activities.delete
	})
};
```

**Configuración:**

```typescript
interface DeleteActionConfig {
	basePath: string; // Ruta base para redirección
	deleteFn: (fetch, slug) => Promise<void>; // Función de eliminación
}
```

**Características especiales:**

- Preserva query params al redirigir al listado
- Maneja error 409 (elemento con dependencias)
- Redirección al referer si falla

---

## Sistema de Flash Messages

### Doble mecanismo

El sistema implementa **dos mecanismos complementarios** para mostrar mensajes:

#### 1. Cookies (para redirects)

```typescript
setFlashMessage(cookies, {
	type: 'success',
	message: 'Actividad creada correctamente.'
});
```

- Se guarda en cookie `flash_message`
- Se lee en `+layout.server.ts`
- Se pasa a `page.data.alert`
- Se muestra después de un redirect

#### 2. Alert inmediato (para fail)

```typescript
return fail(400, {
	form,
	alert: {
		type: 'error',
		message: 'Por favor, corrige los errores del formulario.'
	}
});
```

- Se pasa directamente en el objeto de retorno
- Se accede vía `page.form.alert`
- Se muestra **inmediatamente** sin recargar

### Componente MsgMeltToast

**Ubicación:** `src/lib/components/msg/MsgMeltToast.svelte`

Lee de ambas fuentes automáticamente:

```svelte
const alert = $derived(
  (page.form?.alert as AlertMessage | undefined) ||
  (page.data?.alert as AlertMessage | undefined)
);

$effect(() => {
  if (alert) {
    addToast({
      data: {
        title: alert.type.charAt(0).toUpperCase() + alert.type.slice(1),
        description: alert.message,
        type: alert.type
      }
    });
  }
});
```

---

## Estructura de rutas de creación

Todas las entidades siguen la misma estructura:

```
src/routes/(backoffice)/
├── activities/
│   ├── create/
│   │   ├── +page.server.ts    # createCreateLoad + createCreateAction
│   │   └── +page.svelte        # Usa ActivityForm en modo 'create'
│   ├── [slug]/
│   │   ├── edit/
│   │   │   ├── +page.server.ts    # Load + createUpdateAction
│   │   │   └── +page.svelte        # Usa ActivityForm en modo 'edit'
│   │   └── delete/
│   │       └── +page.server.ts    # createDeleteAction
│   └── components/
│       └── ActivityForm.svelte    # Formulario compartido
├── destinations/
│   └── [misma estructura]
└── attractions/
    └── [misma estructura]
```

---

## Componentes de formulario compartidos

### Patrón de reutilización

Los formularios se reutilizan entre creación y edición mediante una prop `mode`:

```svelte
<!-- ActivityForm.svelte -->
<script lang="ts">
	interface Props {
		data: PageData;
		mode: 'create' | 'edit';
	}

	let { data, mode }: Props = $props();

	const isEditMode = $derived(mode === 'edit');
	const activitySlug = $derived(isEditMode ? data.activity?.slug : undefined);
</script>

<!-- Botón de borrar solo en modo edición -->
{#if isEditMode && activitySlug}
	<form method="POST" action="/activities/{activitySlug}/delete">
		<button type="submit">Borrar</button>
	</form>
{/if}
```

### Uso en páginas

**Página de creación:**

```svelte
<!-- create/+page.svelte -->
<ActivityForm {data} mode="create" />
```

**Página de edición:**

```svelte
<!-- [slug]/edit/+page.svelte -->
<ActivityForm {data} mode="edit" />
```

---

## Entidades implementadas

### 1. Activities (Actividades)

**Rutas:**

- `/activities/create` - Crear nueva actividad
- `/activities/[slug]/edit` - Editar actividad
- `/activities/[slug]/delete` - Eliminar actividad

**Datos disponibles cargados:**

- `availableTags`
- `availableCategories`
- `availableAttractions`
- `availableDestinations`
- `availableDistributives`

**Valores iniciales:**

```typescript
{
  title: '',
  slug: '',
  codeRef: '',
  descriptionFull: '',
  descriptionShort: '',
  infoImportant: '',
  status: 'DRAFT',
  kind: '',
  guideKind: '',
  categories: [],
  tags: [],
  attractions: [],
  destinations: [],
  distributives: [],
  stages: [],
  meals: [],
  included: [],
  excluded: [],
  itemsToBring: [],
  notSuitableFor: []
}
```

### 2. Destinations (Destinos)

**Rutas:**

- `/destinations/create` - Crear nuevo destino
- `/destinations/[slug]/edit` - Editar destino
- `/destinations/[slug]/delete` - Eliminar destino

**Valores iniciales:**

```typescript
{
  name: '',
  slug: '',
  kind: '',
  descriptionShort: '',
  photoUrlHero: ''
}
```

### 3. Attractions (Atracciones)

**Rutas:**

- `/attractions/create` - Crear nueva atracción
- `/attractions/[slug]/edit` - Editar atracción
- `/attractions/[slug]/delete` - Eliminar atracción

**Datos disponibles cargados:**

- `availableDestinations`

**Valores iniciales:**

```typescript
{
  name: '',
  slug: '',
  status: 'DRAFT',
  description: '',
  descriptionLong: '',
  photoUrl: '',
  photoUrlHero: '',
  postalAddress: '',
  location: null,
  destinations: []
}
```

---

## Ventajas del sistema

### 1. DRY (Don't Repeat Yourself)

- Código de creación reducido de ~200 líneas a ~80 líneas
- Lógica de manejo de errores centralizada
- Validación consistente en todas las entidades

### 2. Mantenibilidad

- Cambios en manejo de errores se aplican a todas las entidades
- Fácil añadir nuevas entidades (copiar y adaptar config)
- Código más legible y autodocumentado

### 3. Consistencia

- Mensajes de error estandarizados
- Flash messages funcionan igual en todas partes
- Mismo flujo de usuario en todas las entidades

### 4. Seguridad

- UUID generado en servidor (no en cliente)
- Validación centralizada con Zod
- Manejo consistente de errores de autenticación/autorización

### 5. UX mejorada

- Mensajes flash aparecen inmediatamente (sin recargar)
- Mensajes de error claros y específicos por código HTTP
- Redirección automática después de crear/actualizar

---

## Cómo añadir una nueva entidad

### Paso 1: Crear schema de validación

```typescript
// src/routes/(backoffice)/products/product-form.schema.ts
import { z } from 'zod';

export const productFormSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1, 'El nombre es obligatorio'),
	slug: z.string().min(1, 'El slug es obligatorio'),
	price: z.number().min(0),
	categories: z.array(z.string())
});
```

### Paso 2: Crear página de creación

```typescript
// src/routes/(backoffice)/products/create/+page.server.ts
import { createCreateLoad } from '$lib/server/createLoad';
import { createCreateAction } from '$lib/server/createAction';
import { productFormSchema } from '../product-form.schema';
import { api } from '$lib/api/index';
import { zod } from 'sveltekit-superforms/adapters';

export const load = createCreateLoad({
	schema: zod(productFormSchema),
	initialValues: {
		name: '',
		slug: '',
		price: 0,
		categories: []
	},
	loadAvailableData: async (fetch) => ({
		availableCategories: await api.categories.getAll(fetch)
	}),
	breadcrumbLabel: 'Nuevo producto',
	entityName: 'producto'
});

export const actions = {
	default: createCreateAction({
		basePath: '/products',
		schema: zod(productFormSchema),
		createFn: api.products.create,
		entityName: 'producto',
		redirectToEdit: true
	})
};
```

```svelte
<!-- src/routes/(backoffice)/products/create/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import ProductForm from '../components/ProductForm.svelte';
	import LocationBar from '$lib/layout/partials/LocationBar.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Nuevo Producto - Backoffice</title>
</svelte:head>

<LocationBar title="Nuevo Producto" breadcrumbs={data.breadcrumbs} />

<ProductForm {data} mode="create" />
```

### Paso 3: Crear componente de formulario

```svelte
<!-- src/routes/(backoffice)/products/components/ProductForm.svelte -->
<script lang="ts">
	import type { PageData } from '../$types';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { productFormSchema } from '../product-form.schema';

	interface Props {
		data: PageData;
		mode: 'create' | 'edit';
	}

	let { data, mode }: Props = $props();

	const isEditMode = $derived(mode === 'edit');
	const productSlug = $derived(isEditMode ? data.product?.slug : undefined);

	const { form, errors, enhance } = superForm(data.form, {
		validators: zodClient(productFormSchema)
	});
</script>

<form method="POST" use:enhance>
	<!-- Campos del formulario -->

	{#if isEditMode && productSlug}
		<form method="POST" action="/products/{productSlug}/delete">
			<button type="submit">Borrar</button>
		</form>
	{/if}
</form>
```

### Paso 4: Crear páginas de edición y eliminación

```typescript
// src/routes/(backoffice)/products/[slug]/edit/+page.server.ts
import { createUpdateAction } from '$lib/server/updateAction';

export const actions = {
	default: createUpdateAction({
		basePath: '/products',
		schema: zod(productFormSchema),
		updateFn: api.products.update,
		redirectToEdit: true
	})
};
```

```typescript
// src/routes/(backoffice)/products/[slug]/delete/+page.server.ts
import { createDeleteAction } from '$lib/server/deleteAction';

export const actions = {
	default: createDeleteAction({
		basePath: '/products',
		deleteFn: api.products.delete
	})
};
```

---

## Mejoras futuras

### 1. Tipado más estricto

- Usar generics para tipar mejor los factories
- Inferir tipos de retorno automáticamente

### 2. Validación en servidor

- Añadir validación adicional en factories
- Sanitización de datos antes de enviar a API

### 3. Optimistic UI

- Actualizar UI antes de confirmar con servidor
- Revertir cambios si falla

### 4. Batch operations

- Crear/actualizar múltiples recursos a la vez
- Manejo de errores parciales

### 5. Audit log

- Registrar todas las operaciones CRUD
- Tracking de cambios para auditoría

---

## Referencias

- **Factories:** `/src/lib/server/`
- **Ejemplos de uso:** `/src/routes/(backoffice)/{entity}/create/`
- **Flash messages:** `/src/lib/server/flashMessages.ts`
- **Toast component:** `/src/lib/components/msg/MsgMeltToast.svelte`
