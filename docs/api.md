# Guía del Sistema de API Client

## 📖 Índice

1. [Introducción](#introducción)
2. [Conceptos Fundamentales](#conceptos-fundamentales)
3. [Usar Endpoints Existentes](#usar-endpoints-existentes)
4. [Crear Nuevos Endpoints](#crear-nuevos-endpoints)
5. [Configuración del Sistema](#configuración-del-sistema)
6. [Manejo de Errores](#manejo-de-errores)
7. [Debugging y Logs](#debugging-y-logs)
8. [Mejores Prácticas](#mejores-prácticas)
9. [Ejercicios Prácticos](#ejercicios-prácticos)
10. [FAQ](#faq)
11. [Glosario](#glosario)

---

## Introducción

### ¿Qué es el Sistema de API Client?

Este proyecto utiliza un **cliente de API centralizado** para comunicarse con el backend. En lugar de hacer llamadas `fetch()` directamente en cada archivo, usamos un sistema que:

- ✅ **Centraliza** todas las llamadas a la API en un solo lugar
- ✅ **Reintenta automáticamente** si algo falla (ej: error 500)
- ✅ **Tiene timeout** para evitar esperas infinitas
- ✅ **Maneja errores** de forma elegante y tipada
- ✅ **Facilita el mantenimiento** (un cambio en un lugar afecta todo)

### ¿Por qué NO usamos fetch() directamente?

**❌ Problema con fetch directo:**

```typescript
// En +page.server.ts
const res = await fetch('https://api.example.com/activities');
if (!res.ok) throw error(500); // ¿Y si falla temporalmente?
const data = await res.json();
```

**Problemas:**

1. Si la API falla temporalmente (error 500), no reintenta
2. Si tarda mucho, no hay timeout
3. Cada ruta tiene que manejar errores de forma diferente
4. Si la URL de la API cambia, hay que buscar en 50 archivos
5. No hay logs para debugging

**✅ Solución con nuestro cliente:**

```typescript
import { api, ApiError } from '$lib/api/index';

try {
	const activities = await api.activities.getAll(fetch);
	// ✅ Reintenta 3 veces si falla
	// ✅ Tiene timeout de 30 segundos
	// ✅ Logs automáticos en desarrollo
	// ✅ Errores tipados
} catch (err) {
	if (err instanceof ApiError) {
		// Manejo elegante de errores
	}
}
```

---

## Conceptos Fundamentales

### Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│  Tu código (+page.server.ts)                           │
│  ↓                                                      │
│  import { api } from '$lib/api/index'                  │
│  await api.activities.getAll(fetch)                    │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│  API Client (src/lib/api/)                             │
│  ↓                                                      │
│  1. Lee configuración (config.ts)                      │
│  2. Construye URL (endpoints.config.ts)                │
│  3. Ejecuta request con retry y timeout (client.ts)   │
│  4. Maneja errores (errors.ts)                         │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│  API Externa (https://api.example.com)                 │
│  ← Responde con datos o error                          │
└─────────────────────────────────────────────────────────┘
```

### Estructura de Carpetas

```
src/lib/api/
├── config.ts              ← Configuración general (timeout, retry, etc.)
├── endpoints.config.ts    ← 🌟 Todas las URLs de la API
├── types.ts               ← Tipos TypeScript
├── errors.ts              ← Clases de error personalizadas
├── client.ts              ← Cliente HTTP (la magia ocurre aquí)
├── index.ts               ← Export centralizado
└── endpoints/
    ├── activities.ts      ← Endpoints de activities
    ├── locations.ts       ← Endpoints de locations
    ├── categories.ts      ← Endpoints de categories
    └── tags.ts            ← Endpoints de tags
```

### Flujo de una Petición

```
┌──────────────────────────────────────────────────────────┐
│ 1. Tu código llama a api.activities.getAll()            │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 2. Construye URL desde endpoints.config.ts              │
│    /activities → https://api.example.com/activities     │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 3. Agrega headers (Content-Type, Accept, etc.)          │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 4. Ejecuta fetch() con timeout de 30 segundos           │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 5. ¿Falla? → Reintenta 3 veces con delay exponencial    │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ 6. ¿Éxito? → Devuelve datos                             │
│ ¿Error? → Lanza ApiError tipado                         │
└──────────────────────────────────────────────────────────┘
```

---

## Usar Endpoints Existentes

### Paso 1: Import Necesario

Siempre importa desde `$lib/api/index`:

```typescript
import { api, ApiError } from '$lib/api/index';
```

**⚠️ Nunca hagas:**

```typescript
// ❌ MAL - No importes directamente
import { activitiesEndpoints } from '$lib/api/endpoints/activities';

// ❌ MAL - No uses PUBLIC_API_BASE_URL directamente
import { PUBLIC_API_BASE_URL } from '$env/static/public';
```

### Paso 2: Ejemplos Prácticos

#### Ejemplo 1: Obtener Lista de Actividades (GET)

```typescript
// src/routes/(app)/activities/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { api, ApiError } from '$lib/api/index';

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		// Llamada simple sin parámetros
		const response = await api.activities.getAll(fetch);

		return {
			activities: response.items,
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

#### Ejemplo 2: Obtener Lista con Filtros (GET con params)

```typescript
export const load: PageServerLoad = async ({ fetch, url }) => {
	try {
		// Con parámetros de filtrado
		const response = await api.activities.getAll(fetch, {
			page: 1,
			pageSize: 20,
			location: 'barcelona',
			isFreeTour: true,
			sortBy: 'title',
			sortOrder: 'asc'
		});

		return { activities: response.items };
	} catch (err) {
		// Error handling...
	}
};
```

**💡 Tip:** Los parámetros con `undefined` se ignoran automáticamente:

```typescript
await api.activities.getAll(fetch, {
	page: 1,
	location: undefined // ← No se incluye en la URL
});
// Resultado: GET /activities?page=1
```

#### Ejemplo 3: Obtener Detalle por ID/Slug (GET)

```typescript
export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const activity = await api.activities.getBySlug(fetch, params.slug);

		return { activity };
	} catch (err) {
		if (err instanceof ApiError && err.type === 'not_found') {
			throw error(404, 'Actividad no encontrada');
		}
		throw error(500, 'Error al cargar actividad');
	}
};
```

#### Ejemplo 4: Crear un Recurso (POST)

```typescript
export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const formData = await request.formData();

		try {
			const newActivity = await api.activities.create(fetch, {
				title: formData.get('title') as string,
				slug: formData.get('slug') as string,
				descriptionShort: formData.get('description') as string
			});

			throw redirect(303, `/activities/${newActivity.slug}`);
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status || 500, {
					error: err.message
				});
			}
			return fail(500, { error: 'Error al crear actividad' });
		}
	}
};
```

#### Ejemplo 5: Actualizar un Recurso (PUT)

```typescript
export const actions: Actions = {
	default: async ({ request, params, fetch }) => {
		const formData = await request.formData();

		try {
			await api.activities.update(fetch, params.slug, {
				title: formData.get('title') as string,
				descriptionShort: formData.get('description') as string
			});

			throw redirect(303, `/activities/${params.slug}`);
		} catch (err) {
			// Error handling...
		}
	}
};
```

#### Ejemplo 6: Eliminar un Recurso (DELETE)

```typescript
export const actions: Actions = {
	default: async ({ params, fetch }) => {
		try {
			await api.activities.delete(fetch, params.slug);

			throw redirect(303, '/activities');
		} catch (err) {
			if (err instanceof ApiError) {
				if (err.type === 'not_found') {
					throw error(404, 'Actividad no encontrada');
				}
				if (err.type === 'forbidden') {
					throw error(403, 'No tienes permisos');
				}
			}
			throw error(500, 'Error al eliminar');
		}
	}
};
```

### Paso 3: Endpoints Disponibles

#### Activities

```typescript
api.activities.getAll(fetch, params?)    // GET /activities
api.activities.getBySlug(fetch, slug)    // GET /activities/:slug
api.activities.create(fetch, data)       // POST /activities
api.activities.update(fetch, slug, data) // PUT /activities/:slug
api.activities.delete(fetch, slug)       // DELETE /activities/:slug
```

#### Locations

```typescript
api.locations.getAll(fetch); // GET /locations
api.locations.getById(fetch, id); // GET /locations/:id
api.locations.search(fetch, { q: '...' }); // GET /locations/search?q=...
```

#### Categories

```typescript
api.categories.getAll(fetch); // GET /categories
api.categories.getById(fetch, id); // GET /categories/:id
```

#### Tags

```typescript
api.tags.getAll(fetch); // GET /tags
api.tags.getById(fetch, id); // GET /tags/:id
```

---

## Crear Nuevos Endpoints

### Caso de Uso: Agregar Endpoints de "Bookings" (Reservas)

Imagina que necesitas agregar funcionalidad para gestionar reservas. Sigue estos pasos:

### Paso 1: Definir Rutas en `endpoints.config.ts`

```typescript
// src/lib/api/endpoints.config.ts

// 1.1 Agregar ruta base
export const BASE_PATHS = {
	activities: '/activities',
	locations: '/locations',
	// ... otros existentes
	bookings: '/bookings' // ← NUEVO
} as const;

// 1.2 Definir endpoints específicos
export const BOOKINGS_ENDPOINTS = {
	/** GET /bookings - Listar reservas */
	list: () => BASE_PATHS.bookings,

	/** GET /bookings/:id - Detalle de reserva */
	detail: (id: string) => `${BASE_PATHS.bookings}/${id}`,

	/** POST /bookings - Crear reserva */
	create: () => BASE_PATHS.bookings,

	/** PUT /bookings/:id/cancel - Cancelar reserva */
	cancel: (id: string) => `${BASE_PATHS.bookings}/${id}/cancel`,

	/** GET /bookings/user/:userId - Reservas de un usuario */
	byUser: (userId: string) => `${BASE_PATHS.bookings}/user/${userId}`
} as const;

// 1.3 Agregar al objeto principal
export const API_ENDPOINTS = {
	activities: ACTIVITIES_ENDPOINTS,
	locations: LOCATIONS_ENDPOINTS,
	// ... otros existentes
	bookings: BOOKINGS_ENDPOINTS // ← NUEVO
} as const;
```

**💡 Tip:** Usa comentarios JSDoc (`/** ... */`) para documentar qué hace cada endpoint.

### Paso 2: Crear Módulo del Endpoint

Crea `src/lib/api/endpoints/bookings.ts`:

```typescript
// src/lib/api/endpoints/bookings.ts
import { apiClient } from '../client';
import { API_ENDPOINTS, buildEndpointUrl } from '../endpoints.config';

// 2.1 Definir tipos (puedes crearlos en src/lib/types.ts)
export type Booking = {
	id: string;
	activityId: string;
	userId: string;
	date: string;
	status: 'pending' | 'confirmed' | 'cancelled';
	totalPrice: number;
};

export type BookingListResponse = {
	items: Booking[];
	pagination: {
		page: number;
		pageSize: number;
		total: number;
	};
};

export type CreateBookingData = {
	activityId: string;
	date: string;
	participants: number;
};

// 2.2 Definir parámetros opcionales para filtros
export type BookingsGetAllParams = {
	page?: number;
	pageSize?: number;
	status?: 'pending' | 'confirmed' | 'cancelled';
	userId?: string;
};

// 2.3 Implementar los métodos
export const bookingsEndpoints = {
	/**
	 * Obtener lista de reservas
	 */
	async getAll(fetchFn: typeof fetch, params?: BookingsGetAllParams): Promise<BookingListResponse> {
		const path = buildEndpointUrl(API_ENDPOINTS.bookings.list(), params);

		const response = await apiClient.request<BookingListResponse>(fetchFn, path, { method: 'GET' });

		return response.data;
	},

	/**
	 * Obtener detalle de una reserva
	 */
	async getById(fetchFn: typeof fetch, id: string): Promise<Booking> {
		const path = API_ENDPOINTS.bookings.detail(id);

		const response = await apiClient.request<Booking>(fetchFn, path, { method: 'GET' });

		return response.data;
	},

	/**
	 * Crear una nueva reserva
	 */
	async create(fetchFn: typeof fetch, data: CreateBookingData): Promise<Booking> {
		const path = API_ENDPOINTS.bookings.create();

		const response = await apiClient.request<Booking>(fetchFn, path, {
			method: 'POST',
			body: JSON.stringify(data)
		});

		return response.data;
	},

	/**
	 * Cancelar una reserva
	 */
	async cancel(fetchFn: typeof fetch, id: string): Promise<Booking> {
		const path = API_ENDPOINTS.bookings.cancel(id);

		const response = await apiClient.request<Booking>(fetchFn, path, { method: 'PUT' });

		return response.data;
	},

	/**
	 * Obtener reservas de un usuario
	 */
	async getByUser(fetchFn: typeof fetch, userId: string): Promise<BookingListResponse> {
		const path = API_ENDPOINTS.bookings.byUser(userId);

		const response = await apiClient.request<BookingListResponse>(fetchFn, path, { method: 'GET' });

		return response.data;
	}
};
```

### Paso 3: Exportar desde `index.ts`

```typescript
// src/lib/api/index.ts

// ... imports existentes
import { bookingsEndpoints } from './endpoints/bookings'; // ← NUEVO

export const api = {
	activities: activitiesEndpoints,
	locations: locationsEndpoints,
	categories: categoriesEndpoints,
	tags: tagsEndpoints,
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

### Paso 4: Usar el Nuevo Endpoint

```typescript
// src/routes/(app)/bookings/+page.server.ts
import { api, ApiError } from '$lib/api/index';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		const response = await api.bookings.getAll(fetch, {
			page: 1,
			pageSize: 10,
			status: 'confirmed'
		});

		return {
			bookings: response.items,
			pagination: response.pagination
		};
	} catch (err) {
		// Error handling...
	}
};
```

**🎉 ¡Listo!** Ahora tienes endpoints completamente funcionales para bookings.

### Checklist de Validación

Cuando agregues un nuevo endpoint, verifica:

- [ ] Ruta base agregada en `BASE_PATHS`
- [ ] Endpoints definidos en `*_ENDPOINTS`
- [ ] Objeto agregado a `API_ENDPOINTS`
- [ ] Módulo creado en `endpoints/*.ts`
- [ ] Tipos TypeScript definidos
- [ ] Métodos implementados con documentación
- [ ] Exportado desde `index.ts`
- [ ] Probado en una ruta real

---

## Configuración del Sistema

### Modificar Rutas Base

Si la API cambia de URL o versión:

```typescript
// src/lib/api/endpoints.config.ts

export const BASE_PATHS = {
	// Cambiar de v1 a v2
	activities: '/api/v2/activities', // antes: '/activities'

	// Agregar prefijo
	locations: '/api/locations' // antes: '/locations'
} as const;
```

**✅ Ventaja:** Un solo cambio actualiza TODAS las llamadas a la API.

### Ajustar Timeouts

```typescript
// src/lib/api/config.ts

export const apiConfig = {
	timeout: 60000 // ← Cambiar a 60 segundos (era 30000)

	// ... resto de configuración
};
```

**Casos de uso:**

- API lenta → Aumentar timeout
- Operaciones críticas → Reducir timeout para fallar rápido

### Configurar Retry Logic

```typescript
// src/lib/api/config.ts

export const apiConfig = {
	retry: {
		attempts: 5, // ← Reintentar 5 veces (era 3)
		delay: 2000, // ← Esperar 2 segundos (era 1000)
		backoff: 3, // ← Multiplicar x3 cada intento (era x2)
		retryOn: [408, 429, 500, 502, 503, 504] // Códigos HTTP a reintentar
	}
};
```

**Cómo funciona el backoff exponencial:**

```
Intento 1: Espera 2000ms (2s)
Intento 2: Espera 6000ms (2s × 3 = 6s)
Intento 3: Espera 18000ms (6s × 3 = 18s)
Intento 4: Espera 54000ms (18s × 3 = 54s)
```

**⚠️ Warning:** No aumentes demasiado los reintentos o el usuario esperará mucho tiempo.

### Agregar Headers Personalizados

```typescript
// src/lib/api/config.ts

export const apiConfig = {
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
		'X-App-Version': '2.0.0', // ← Versión de la app
		'X-Client-Platform': 'web', // ← NUEVO
		'X-Request-ID': generateUUID() // ← NUEVO
	}
};
```

### Activar/Desactivar Logs

```typescript
// src/lib/api/config.ts

export const apiConfig = {
	// Logs solo en desarrollo
	debug: import.meta.env.DEV,

	// O siempre activos
	debug: true,

	// O siempre desactivados
	debug: false
};
```

---

## Manejo de Errores

### Tipos de Errores

El sistema distingue 8 tipos de errores:

```typescript
type ApiErrorType =
	| 'network' // Error de red (sin conexión)
	| 'timeout' // Request tardó demasiado
	| 'not_found' // 404 - Recurso no existe
	| 'unauthorized' // 401 - No autenticado
	| 'forbidden' // 403 - Sin permisos
	| 'validation' // 422 - Datos inválidos
	| 'server_error' // 500+ - Error del servidor
	| 'unknown'; // Otro error
```

### Manejo Básico

```typescript
try {
	const activity = await api.activities.getBySlug(fetch, slug);
	return { activity };
} catch (err) {
	if (err instanceof ApiError) {
		console.error('Error de API:', err.type, err.message);
		throw error(err.status || 500, err.message);
	}

	// Error no relacionado con la API
	throw error(500, 'Error inesperado');
}
```

### Manejo Avanzado por Tipo

```typescript
try {
	const booking = await api.bookings.create(fetch, data);
	return { booking };
} catch (err) {
	if (err instanceof ApiError) {
		switch (err.type) {
			case 'not_found':
				return fail(404, {
					error: 'La actividad no existe'
				});

			case 'validation':
				return fail(422, {
					error: 'Datos inválidos',
					details: err.data // Detalles del servidor
				});

			case 'forbidden':
				return fail(403, {
					error: 'No tienes permisos para crear reservas'
				});

			case 'network':
				return fail(503, {
					error: 'Sin conexión a internet'
				});

			case 'timeout':
				return fail(504, {
					error: 'El servidor tardó demasiado en responder'
				});

			case 'server_error':
				return fail(500, {
					error: 'Error del servidor. Intenta más tarde.'
				});

			default:
				return fail(500, {
					error: 'Error desconocido'
				});
		}
	}

	return fail(500, { error: 'Error inesperado' });
}
```

### Mensajes de Error Personalizados

```typescript
const ERROR_MESSAGES: Record<ApiErrorType, string> = {
	network: 'Sin conexión a internet. Verifica tu red.',
	timeout: 'La operación tardó demasiado. Intenta nuevamente.',
	not_found: 'El recurso solicitado no existe.',
	unauthorized: 'Necesitas iniciar sesión.',
	forbidden: 'No tienes permisos para esta acción.',
	validation: 'Los datos ingresados son inválidos.',
	server_error: 'Error del servidor. Contacta soporte.',
	unknown: 'Error inesperado. Intenta más tarde.'
};

try {
	// ... tu código
} catch (err) {
	if (err instanceof ApiError) {
		const message = ERROR_MESSAGES[err.type];
		return fail(err.status || 500, { error: message });
	}
}
```

### Acceder a Datos del Error

```typescript
catch (err) {
  if (err instanceof ApiError) {
    console.log('Tipo:', err.type);           // 'validation'
    console.log('Status:', err.status);       // 422
    console.log('Mensaje:', err.message);     // 'Validation error'
    console.log('URL:', err.url);             // '/api/bookings'
    console.log('Data:', err.data);           // { field: 'email', error: 'invalid' }
  }
}
```

---

## Debugging y Logs

### Logs Automáticos en Desarrollo

Con `debug: true` en `config.ts`, verás logs automáticos:

```
[API] GET https://api.example.com/activities?page=1
[API] Success: https://api.example.com/activities?page=1 { status: 200 }
```

O en caso de error:

```
[API] GET https://api.example.com/activities/invalid-slug
[API] Failed: https://api.example.com/activities/invalid-slug ApiError {
  type: 'not_found',
  message: 'Resource not found',
  status: 404
}
```

### Debugging Manual

```typescript
import { apiClient } from '$lib/api/index';

// Hacer un request con logs forzados
try {
	const response = await apiClient.request(fetch, '/activities', {
		method: 'GET',
		silent: false // ← Fuerza logs aunque debug esté en false
	});
} catch (err) {
	console.error('Error capturado:', err);
}
```

### Ver Request Completo

```typescript
// Interceptar antes de enviar (útil para debugging)
const response = await apiClient.request(fetch, path, {
	method: 'POST',
	body: JSON.stringify(data)
});

console.log('Request enviado:', {
	url: `${apiConfig.baseURL}${path}`,
	method: 'POST',
	headers: apiConfig.headers,
	body: data
});
```

### Herramientas Útiles

1. **DevTools Network Tab**
   - Abre Chrome DevTools → Network
   - Filtra por "Fetch/XHR"
   - Ve todas las llamadas a la API

2. **Console Logs**
   - Modo desarrollo: logs automáticos
   - Producción: usa `silent: false` para debugging específico

3. **Postman/Insomnia**
   - Prueba endpoints manualmente
   - Compara respuestas con lo esperado

---

## Mejores Prácticas

### ✅ Qué SÍ Hacer

#### 1. Siempre Importar desde `$lib/api/index`

```typescript
// ✅ BIEN
import { api, ApiError } from '$lib/api/index';
```

#### 2. Usar try-catch con ApiError

```typescript
// ✅ BIEN
try {
	const data = await api.activities.getAll(fetch);
	return { data };
} catch (err) {
	if (err instanceof ApiError) {
		// Manejo específico
	}
	// Manejo genérico
}
```

#### 3. Definir Tipos para Parámetros

```typescript
// ✅ BIEN
export type GetActivitiesParams = {
  page?: number;
  pageSize?: number;
  location?: string;
};

async getAll(fetchFn: typeof fetch, params?: GetActivitiesParams) {
  // ...
}
```

#### 4. Documentar Endpoints con JSDoc

```typescript
// ✅ BIEN
export const BOOKINGS_ENDPOINTS = {
	/** GET /bookings - Lista de reservas */
	list: () => BASE_PATHS.bookings,

	/** POST /bookings/:id/cancel - Cancelar reserva */
	cancel: (id: string) => `${BASE_PATHS.bookings}/${id}/cancel`
};
```

#### 5. Manejar Errores Específicos

```typescript
// ✅ BIEN
catch (err) {
  if (err instanceof ApiError) {
    if (err.type === 'not_found') {
      return fail(404, { error: 'No encontrado' });
    }
    if (err.type === 'validation') {
      return fail(422, { error: 'Datos inválidos' });
    }
  }
}
```

### ❌ Qué NO Hacer

#### 1. No Usar fetch() Directamente

```typescript
// ❌ MAL
const res = await fetch(`${PUBLIC_API_BASE_URL}/activities`);
const data = await res.json();

// ✅ BIEN
const data = await api.activities.getAll(fetch);
```

#### 2. No Importar Módulos Internos

```typescript
// ❌ MAL
import { activitiesEndpoints } from '$lib/api/endpoints/activities';

// ✅ BIEN
import { api } from '$lib/api/index';
```

#### 3. No Hardcodear URLs

```typescript
// ❌ MAL
const url = 'https://api.example.com/activities';

// ✅ BIEN - Usa endpoints.config.ts
const path = API_ENDPOINTS.activities.list();
```

#### 4. No Ignorar Errores

```typescript
// ❌ MAL
try {
  const data = await api.activities.getAll(fetch);
} catch (err) {
  // Vacío o console.log genérico
}

// ✅ BIEN
catch (err) {
  if (err instanceof ApiError) {
    // Manejo específico
  }
  throw error(500, 'Error');
}
```

#### 5. No Duplicar Lógica

```typescript
// ❌ MAL - Lógica repetida en cada ruta
export const load = async ({ fetch }) => {
	const res = await fetch('...');
	if (!res.ok) throw error(500);
	// Retry manual, timeout manual, etc.
};

// ✅ BIEN - Cliente maneja todo
export const load = async ({ fetch }) => {
	const data = await api.activities.getAll(fetch);
	return { data };
};
```

### 📋 Code Snippets Útiles

#### Snippet 1: Load Básico con Error Handling

```typescript
export const load: PageServerLoad = async ({ fetch }) => {
	try {
		const data = await api.activities.getAll(fetch);
		return { data };
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status || 500, err.message);
		}
		throw error(500, 'Error inesperado');
	}
};
```

#### Snippet 2: Action con Validación

```typescript
export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const formData = await request.formData();

		try {
			const result = await api.activities.create(fetch, {
				title: formData.get('title') as string
			});

			throw redirect(303, `/activities/${result.slug}`);
		} catch (err) {
			if (err instanceof ApiError) {
				if (err.type === 'validation') {
					return fail(422, {
						error: 'Datos inválidos',
						details: err.data
					});
				}
			}
			return fail(500, { error: 'Error al crear' });
		}
	}
};
```

---

## Ejercicios Prácticos

### Ejercicio 1: Usar un Endpoint Existente

**Objetivo:** Crear una página que liste todas las ubicaciones.

**Pasos:**

1. Crea `src/routes/(app)/locations/+page.server.ts`
2. Importa `api` y `ApiError`
3. Usa `api.locations.getAll(fetch)`
4. Maneja errores correctamente
5. Devuelve los datos

**Solución:**

```typescript
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { api, ApiError } from '$lib/api/index';

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		const locations = await api.locations.getAll(fetch);
		return { locations };
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status || 500, 'Error al cargar ubicaciones');
		}
		throw error(500, 'Error inesperado');
	}
};
```

### Ejercicio 2: Crear un Nuevo Endpoint

**Objetivo:** Agregar endpoints para "Reviews" (Reseñas).

**Requisitos:**

- Listar reseñas: `GET /reviews`
- Crear reseña: `POST /reviews`
- Eliminar reseña: `DELETE /reviews/:id`

**Pasos:**

1. Modifica `endpoints.config.ts`:
   - Agrega `reviews: '/reviews'` a `BASE_PATHS`
   - Crea `REVIEWS_ENDPOINTS` con list, create, delete
   - Agrégalo a `API_ENDPOINTS`

2. Crea `src/lib/api/endpoints/reviews.ts`:
   - Define tipos (Review, CreateReviewData)
   - Implementa reviewsEndpoints

3. Exporta desde `index.ts`

4. Úsalo en una ruta

**Solución (parcial):**

```typescript
// endpoints.config.ts
export const BASE_PATHS = {
	// ... existentes
	reviews: '/reviews'
};

export const REVIEWS_ENDPOINTS = {
	list: () => BASE_PATHS.reviews,
	create: () => BASE_PATHS.reviews,
	delete: (id: string) => `${BASE_PATHS.reviews}/${id}`
};

export const API_ENDPOINTS = {
	// ... existentes
	reviews: REVIEWS_ENDPOINTS
};
```

```typescript
// endpoints/reviews.ts
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints.config';

export type Review = {
	id: string;
	activityId: string;
	rating: number;
	comment: string;
};

export const reviewsEndpoints = {
	async getAll(fetchFn: typeof fetch): Promise<Review[]> {
		const response = await apiClient.request<Review[]>(fetchFn, API_ENDPOINTS.reviews.list(), {
			method: 'GET'
		});
		return response.data;
	}
	// ... implementar create y delete
};
```

### Ejercicio 3: Manejo Avanzado de Errores

**Objetivo:** Crear una acción que maneje todos los tipos de error de forma específica.

**Código inicial:**

```typescript
export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const formData = await request.formData();

		try {
			await api.bookings.create(fetch, {
				activityId: formData.get('activityId') as string,
				date: formData.get('date') as string,
				participants: parseInt(formData.get('participants') as string)
			});

			throw redirect(303, '/bookings');
		} catch (err) {
			// TODO: Implementar manejo de errores específico
		}
	}
};
```

**Tu tarea:** Completa el catch para manejar:

- not_found → 'La actividad no existe'
- validation → Mostrar detalles del error
- unauthorized → 'Debes iniciar sesión'
- network → 'Sin conexión'
- Otros → Mensaje genérico

**Solución:**

```typescript
catch (err) {
  if (err instanceof ApiError) {
    const errorMessages: Record<string, string> = {
      not_found: 'La actividad no existe',
      unauthorized: 'Debes iniciar sesión para reservar',
      forbidden: 'No tienes permisos para reservar',
      network: 'Sin conexión a internet',
      timeout: 'El servidor tardó demasiado',
      server_error: 'Error del servidor. Intenta más tarde'
    };

    const message = errorMessages[err.type] || 'Error al crear reserva';

    return fail(err.status || 500, {
      error: message,
      details: err.type === 'validation' ? err.data : undefined
    });
  }

  return fail(500, { error: 'Error inesperado' });
}
```

---

## FAQ

### ¿Por qué necesito pasar `fetch` como parámetro?

En SvelteKit, el `fetch` del servidor tiene capacidades especiales (cookies, headers, etc.). Por eso lo pasamos como parámetro en lugar de usar `fetch` global.

```typescript
// En +page.server.ts
export const load = async ({ fetch }) => {
	// Usa ESTE fetch, no el global
	await api.activities.getAll(fetch);
};
```

### ¿Cómo agrego autenticación (JWT)?

El sistema está preparado para esto. Necesitarás:

1. Crear un `AuthProvider`
2. Configurarlo en el cliente

Documentación detallada pendiente (próximamente).

### ¿Puedo desactivar el retry para un request específico?

Sí:

```typescript
await apiClient.request(fetch, path, {
	method: 'POST',
	retry: false // ← No reintenta
});

// O especifica número de intentos
await apiClient.request(fetch, path, {
	method: 'POST',
	retry: 1 // ← Solo 1 reintento
});
```

### ¿Cómo cambio el timeout para un request específico?

```typescript
await apiClient.request(fetch, path, {
	method: 'GET',
	timeout: 60000 // ← 60 segundos para ESTE request
});
```

### ¿Puedo usar el cliente fuera de +page.server.ts?

Sí, pero debes pasar `fetch`. Ejemplo en un helper:

```typescript
// src/lib/utils/activityHelper.ts
export async function getActivityBySlug(fetchFn: typeof fetch, slug: string) {
	return await api.activities.getBySlug(fetchFn, slug);
}
```

### ¿Qué pasa si la API devuelve HTML en lugar de JSON?

El cliente maneja esto automáticamente:

```typescript
// Si Content-Type es text/html
const response = await apiClient.request(fetch, path);
console.log(response.data); // String con HTML
```

### ¿Cómo sé qué endpoints están disponibles?

Revisa `src/lib/api/endpoints.config.ts` - Tiene TODOS los endpoints definidos con comentarios.

### ¿Puedo mockear el cliente para tests?

Sí (documentación de testing próximamente).

---

## Glosario

**API (Application Programming Interface)**
Interfaz que permite que dos aplicaciones se comuniquen. En este proyecto, nuestra app frontend se comunica con un backend a través de una REST API.

**Endpoint**
Una URL específica de la API que realiza una acción. Ej: `GET /activities` es un endpoint que lista actividades.

**HTTP Status Code**
Número que indica el resultado de una petición HTTP:

- 200-299: Éxito
- 400-499: Error del cliente (ej: 404 no encontrado)
- 500-599: Error del servidor

**Retry Logic**
Mecanismo que reintenta una operación fallida automáticamente. Ej: Si el servidor responde con error 500, el cliente reintenta 3 veces.

**Timeout**
Tiempo máximo de espera para una operación. Si el servidor no responde en 30 segundos, se cancela la petición.

**Exponential Backoff**
Estrategia donde cada reintento espera más tiempo que el anterior. Ej: 1s, 2s, 4s, 8s...

**Type-safe**
Código donde TypeScript verifica tipos en tiempo de compilación, evitando errores.

**Fetch**
API nativa del navegador para hacer peticiones HTTP.

**JWT (JSON Web Token)**
Token de autenticación usado para identificar usuarios.

**CRUD**
Create, Read, Update, Delete - Operaciones básicas sobre datos.

**Query Params**
Parámetros en la URL. Ej: `?page=1&pageSize=10`

**Slug**
Identificador legible en URLs. Ej: `barcelona-food-tour` en lugar de `123`.

---

## Recursos Adicionales

### Documentación Oficial

- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [MDN Web Docs - Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

### Archivos del Proyecto

- `README.md` - Documentación general del proyecto
- `AI.md` - Convenciones para IA
- `docs/i18n-paraglide.md` - Internacionalización

### Contacto

Si tienes dudas, revisa:

1. Esta documentación
2. El código en `src/lib/api/`
3. Ejemplos en `src/routes/(app)/activities/`
4. Pregunta al equipo en Slack/Discord

---

**Última actualización:** 2026-01-23

**Versión:** 1.0

**Autor:** Equipo de Desarrollo
