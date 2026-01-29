# Skill: Add API Endpoint

Añade un nuevo endpoint a la API siguiendo la estructura refactorizada del proyecto. Este skill guía la creación de endpoints con metadata completa, tipos TypeScript y métodos tipados.

## Uso

```bash
# Interactivo - el agente preguntará detalles
add-api-endpoint

# Con argumentos
add-api-endpoint <resource> <action> [method]
```

## Ejemplos

```bash
add-api-endpoint bookings create POST
add-api-endpoint bookings cancel PUT
add-api-endpoint reviews list GET
```

## ¿Cuándo usar este Skill?

- ✅ Necesitas añadir un nuevo endpoint a un recurso existente
- ✅ Necesitas crear un recurso completamente nuevo
- ✅ Quieres que el endpoint aparezca automáticamente en `/api-catalog`
- ✅ Sigues la estructura post-refactor con `.path()`

## Workflow Detallado

### Paso 1: Identificar el Recurso y Acción

El agente debe preguntar:

1. **¿Es un recurso nuevo o existente?**
   - Nuevo → Crear grupo completo en `API_ENDPOINTS`
   - Existente → Añadir al grupo existente

2. **¿Qué acción realiza?**
   - `list` - Listar recursos (GET)
   - `detail` - Obtener uno por ID/slug (GET)
   - `create` - Crear nuevo (POST)
   - `update` - Actualizar completo (PUT)
   - `patch` - Actualizar parcial (PATCH)
   - `delete` - Eliminar (DELETE)
   - Custom - Acción personalizada

3. **¿Qué método HTTP?**
   - GET - Lectura
   - POST - Creación
   - PUT - Actualización completa
   - PATCH - Actualización parcial
   - DELETE - Eliminación

4. **¿Qué parámetros acepta?**
   - Path params (ej: `id`, `slug`)
   - Query params (ej: `page`, `limit`, `status`)
   - Body params (ej: `title`, `description`)

Archivos involucrados:

```
src/lib/api/
├── endpoints-metadata.ts          ← Añadir metadata del endpoint
├── endpoints/
│   └── [resource].ts              ← Implementar método
└── index.ts                       ← Exportar (si es nuevo recurso)
```

---

### Paso 2: Añadir Base Path (Solo para Recursos Nuevos)

**Ubicación:** `src/lib/api/endpoints-metadata.ts`

**Solo si el recurso NO existe:**

```typescript
export const BASE_PATHS = {
	activities: '/activities',
	locations: '/locations',
	// ... otros existentes

	bookings: '/bookings' // ← NUEVO recurso
} as const;
```

---

### Paso 3: Añadir Endpoint a API_ENDPOINTS

**Ubicación:** `src/lib/api/endpoints-metadata.ts`

**Estructura completa con metadata:**

#### Para Recurso Nuevo:

```typescript
export const API_ENDPOINTS = {
	// ... recursos existentes

	// ← NUEVO recurso completo
	bookings: {
		groupName: 'Bookings',
		groupDescription: 'Gestión de reservas',

		list: {
			path: () => BASE_PATHS.bookings,
			method: 'GET',
			description: 'Obtiene listado de reservas con paginación',
			params: ['page', 'limit', 'status', 'userId']
		},

		detail: {
			path: (id: string) => `${BASE_PATHS.bookings}/${id}`,
			method: 'GET',
			description: 'Obtiene detalles de una reserva específica',
			params: ['id']
		},

		create: {
			path: () => BASE_PATHS.bookings,
			method: 'POST',
			description: 'Crea una nueva reserva',
			params: ['body']
		},

		cancel: {
			path: (id: string) => `${BASE_PATHS.bookings}/${id}/cancel`,
			method: 'PUT',
			description: 'Cancela una reserva existente',
			params: ['id']
		}
	}
} as const;
```

#### Para Añadir a Recurso Existente:

```typescript
export const API_ENDPOINTS = {
	activities: {
		groupName: 'Activities',
		groupDescription: 'Gestión de actividades turísticas',

		// ... endpoints existentes (list, detail, create, etc.)

		// ← NUEVO endpoint en recurso existente
		duplicate: {
			path: (slug: string) => `${BASE_PATHS.activities}/${slug}/duplicate`,
			method: 'POST',
			description: 'Duplica una actividad existente',
			params: ['slug']
		}
	}
} as const;
```

**Estructura de cada endpoint:**

- `path`: Función que genera la URL (con o sin parámetros)
- `method`: Método HTTP (GET, POST, PUT, PATCH, DELETE)
- `description`: Texto descriptivo de qué hace
- `params`: Array de parámetros que acepta

**Patrones comunes:**

**Sin parámetros:**

```typescript
list: {
  path: () => BASE_PATHS.resource,
  method: 'GET',
  description: 'Lista todos los recursos',
  params: ['page', 'limit']
}
```

**Con ID/slug:**

```typescript
detail: {
  path: (id: string) => `${BASE_PATHS.resource}/${id}`,
  method: 'GET',
  description: 'Obtiene un recurso por ID',
  params: ['id']
}
```

**Acción custom:**

```typescript
publish: {
  path: (id: string) => `${BASE_PATHS.resource}/${id}/publish`,
  method: 'PUT',
  description: 'Publica un recurso',
  params: ['id']
}
```

---

### Paso 4: Crear/Actualizar Módulo del Endpoint

**Ubicación:** `src/lib/api/endpoints/[resource].ts`

#### A. Definir Tipos TypeScript

```typescript
import { apiClient } from '../client';
import { API_ENDPOINTS, buildEndpointUrl } from '../endpoints-metadata';

// Tipo del recurso individual
export type Booking = {
	id: string;
	activityId: string;
	userId: string;
	date: string;
	status: 'pending' | 'confirmed' | 'cancelled';
	totalPrice: number;
	participants: number;
	createdAt: string;
};

// Tipo de respuesta con paginación (para list)
export type BookingListResponse = {
	data: Booking[];
	pagination: {
		page: number;
		pageSize: number;
		total: number;
		totalPages: number;
	};
};

// Tipo para crear nuevo (solo campos editables)
export type CreateBookingData = {
	activityId: string;
	date: string;
	participants: number;
};

// Tipo para parámetros de filtrado
export type BookingsGetAllParams = {
	page?: number;
	pageSize?: number;
	status?: 'pending' | 'confirmed' | 'cancelled';
	userId?: string;
	from?: string;
	to?: string;
};
```

#### B. Implementar Métodos

```typescript
export const bookingsEndpoints = {
	/**
	 * GET /bookings - Lista de reservas con paginación
	 */
	async getAll(fetchFn: typeof fetch, params?: BookingsGetAllParams): Promise<BookingListResponse> {
		// ✅ IMPORTANTE: Usar .path() para obtener la URL
		const path = buildEndpointUrl(API_ENDPOINTS.bookings.list.path(), params);

		const response = await apiClient.request<BookingListResponse>(fetchFn, path, { method: 'GET' });

		return response.data;
	},

	/**
	 * GET /bookings/:id - Detalle de una reserva
	 */
	async getById(fetchFn: typeof fetch, id: string): Promise<Booking> {
		// ✅ IMPORTANTE: Pasar el parámetro a .path()
		const path = API_ENDPOINTS.bookings.detail.path(id);

		const response = await apiClient.request<Booking>(fetchFn, path, { method: 'GET' });

		return response.data;
	},

	/**
	 * POST /bookings - Crear nueva reserva
	 */
	async create(fetchFn: typeof fetch, data: CreateBookingData): Promise<Booking> {
		const path = API_ENDPOINTS.bookings.create.path();

		const response = await apiClient.request<Booking>(fetchFn, path, {
			method: 'POST',
			body: JSON.stringify(data)
		});

		return response.data;
	},

	/**
	 * PUT /bookings/:id/cancel - Cancelar reserva
	 */
	async cancel(fetchFn: typeof fetch, id: string): Promise<Booking> {
		const path = API_ENDPOINTS.bookings.cancel.path(id);

		const response = await apiClient.request<Booking>(fetchFn, path, { method: 'PUT' });

		return response.data;
	}
};
```

**Patrones de implementación:**

**GET sin parámetros:**

```typescript
async getAll(fetchFn: typeof fetch): Promise<Resource[]> {
  const path = API_ENDPOINTS.resource.list.path();
  const response = await apiClient.request<Resource[]>(fetchFn, path, {
    method: 'GET'
  });
  return response.data;
}
```

**GET con query params:**

```typescript
async getAll(
  fetchFn: typeof fetch,
  params?: { page?: number; limit?: number }
): Promise<ResourceListResponse> {
  const path = buildEndpointUrl(API_ENDPOINTS.resource.list.path(), params);
  // ... resto
}
```

**GET con path param:**

```typescript
async getById(fetchFn: typeof fetch, id: string): Promise<Resource> {
  const path = API_ENDPOINTS.resource.detail.path(id);
  // ... resto
}
```

**POST con body:**

```typescript
async create(
  fetchFn: typeof fetch,
  data: CreateResourceData
): Promise<Resource> {
  const path = API_ENDPOINTS.resource.create.path();
  const response = await apiClient.request<Resource>(fetchFn, path, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.data;
}
```

**PUT/PATCH con ID y body:**

```typescript
async update(
  fetchFn: typeof fetch,
  id: string,
  data: UpdateResourceData
): Promise<Resource> {
  const path = API_ENDPOINTS.resource.update.path(id);
  const response = await apiClient.request<Resource>(fetchFn, path, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return response.data;
}
```

**DELETE:**

```typescript
async delete(fetchFn: typeof fetch, id: string): Promise<void> {
  const path = API_ENDPOINTS.resource.delete.path(id);
  await apiClient.request<void>(fetchFn, path, {
    method: 'DELETE'
  });
}
```

---

### Paso 5: Exportar desde index.ts (Solo para Recursos Nuevos)

**Ubicación:** `src/lib/api/index.ts`

**Solo si es un recurso completamente nuevo:**

```typescript
// ... imports existentes
import { bookingsEndpoints } from './endpoints/bookings'; // ← NUEVO

export const api = {
	activities: activitiesEndpoints,
	locations: locationsEndpoints,
	categories: categoriesEndpoints,
	tags: tagsEndpoints,
	attractions: attractionsEndpoints,
	destinations: destinationsEndpoints,
	bookings: bookingsEndpoints // ← NUEVO
};

// Exportar tipos también
export type {
	Booking,
	BookingListResponse,
	CreateBookingData,
	BookingsGetAllParams
} from './endpoints/bookings'; // ← NUEVO
```

---

### Paso 6: Verificar en `/api-catalog`

**Acción:** Abrir el navegador en `/api-catalog`

**Verificar:**

- ✅ El nuevo endpoint aparece en la lista
- ✅ Muestra el método HTTP correcto
- ✅ Muestra la descripción
- ✅ Muestra los parámetros
- ✅ El path se ve correctamente

**Si NO aparece:**

- Revisar que añadiste el endpoint en `API_ENDPOINTS`
- Verificar que tiene `groupName` y `groupDescription`
- Verificar que usas la estructura correcta con metadata

---

### Paso 7: Usar el Endpoint en la App

**Ejemplo en `+page.server.ts`:**

```typescript
import { api, ApiError } from '$lib/api/index';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		// ✅ Usar el nuevo endpoint
		const response = await api.bookings.getAll(fetch, {
			page: 1,
			pageSize: 20,
			status: 'confirmed'
		});

		return {
			bookings: response.data,
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

---

## Checklist de Verificación

Antes de terminar, verificar:

- [ ] ✅ `BASE_PATHS` actualizado (si es recurso nuevo)
- [ ] ✅ Endpoint añadido a `API_ENDPOINTS` con metadata completa
- [ ] ✅ Incluye: `path`, `method`, `description`, `params`
- [ ] ✅ Módulo creado en `endpoints/[resource].ts`
- [ ] ✅ Tipos TypeScript definidos
- [ ] ✅ Métodos implementados usando `.path()`
- [ ] ✅ Exportado desde `index.ts` (si es nuevo)
- [ ] ✅ Aparece en `/api-catalog`
- [ ] ✅ Probado en una página real
- [ ] ✅ Manejo de errores con `ApiError`

---

## Errores Comunes y Soluciones

### ❌ Error: "This expression is not callable"

**Causa:** Olvidaste usar `.path()` al llamar al endpoint

```typescript
// ❌ Incorrecto (pre-refactor)
const path = API_ENDPOINTS.bookings.list();

// ✅ Correcto (post-refactor)
const path = API_ENDPOINTS.bookings.list.path();
```

---

### ❌ Error: Endpoint no aparece en `/api-catalog`

**Causa:** Falta metadata completa o `groupName`/`groupDescription`

**Solución:** Asegurar que el recurso tiene:

```typescript
bookings: {
  groupName: 'Bookings',           // ← Requerido
  groupDescription: '...',          // ← Requerido

  list: {
    path: () => ...,                // ← Requerido
    method: 'GET',                  // ← Requerido
    description: '...',             // ← Requerido
    params: [...]                   // ← Requerido
  }
}
```

---

### ❌ Error: TypeScript types not working

**Causa:** No exportaste los tipos desde `index.ts`

**Solución:** Añadir export de tipos:

```typescript
export type { Booking, BookingListResponse } from './endpoints/bookings';
```

---

### ❌ Error: Cannot find module

**Causa:** Olvidaste importar en `index.ts`

**Solución:** Añadir import y export:

```typescript
import { bookingsEndpoints } from './endpoints/bookings';

export const api = {
	// ...
	bookings: bookingsEndpoints
};
```

---

## Patrones de Respuesta de la API

**Lista con paginación:**

```typescript
{
  data: Resource[],
  pagination: {
    page: number,
    pageSize: number,
    total: number,
    totalPages: number
  }
}
```

**Detalle único:**

```typescript
{
	data: Resource;
}
// O directamente Resource
```

**Error:**

```typescript
{
  error: string,
  details?: any
}
```

---

## Notas Importantes

- 🎯 **Siempre** usa `.path()` para obtener URLs - estructura post-refactor
- 🎯 **Siempre** incluye metadata completa en `API_ENDPOINTS`
- 🎯 **Siempre** define tipos TypeScript para request/response
- 🎯 **Siempre** maneja errores con `ApiError`
- 🎯 **Nunca** uses `fetch()` directamente - usa el API client
- 🎯 **Nunca** hardcodees URLs - usa `API_ENDPOINTS`

---

## Referencias

- Endpoints existentes: `src/lib/api/endpoints/activities.ts`
- Metadata completa: `src/lib/api/endpoints-metadata.ts`
- Catálogo visual: `/api-catalog` en el navegador
- Documentación API: `docs/api.md`
