# API Routes (Proxy Endpoints)

## Propósito

Esta carpeta contiene **endpoints proxy** que actúan como intermediarios entre el cliente (navegador) y la API REST externa.

## ¿Por qué existen estos endpoints?

### Problema

Algunos componentes del frontend (como `FilterSelectRemote`) necesitan hacer peticiones asíncronas desde el navegador (en el `onMount`). Si hacemos estas peticiones directamente a la API externa, exponemos:

- La dirección IP/URL de la API backend
- Detalles de infraestructura interna
- Potenciales vectores de ataque

### Solución

Los endpoints en esta carpeta actúan como **proxies del lado del servidor**:

```
Cliente (navegador)          SvelteKit App            API Externa
     |                            |                        |
     |  GET /api/attraction-status|                        |
     |--------------------------->|                        |
     |                            | GET /attraction-status |
     |                            |----------------------->|
     |                            |<-----------------------|
     |<---------------------------|                        |
     |     JSON Response          |                        |
```

## Características

✅ **Seguridad**: La URL de la API externa nunca se expone al cliente  
✅ **Consistencia**: Usa la infraestructura `$lib/api` existente (cliente, manejo de errores, retry, timeout)  
✅ **Mantenibilidad**: Un solo punto de configuración (`.env`)  
✅ **SSR Compatible**: Funciona tanto en servidor como cliente

## Estructura

```
src/routes/api/
├── README.md                    # Este archivo
├── attraction-status/
│   └── +server.ts              # GET /api/attraction-status
└── destination-kind/
    └── +server.ts              # GET /api/destination-kind
```

## Uso desde componentes

```svelte
<!-- ANTES (❌ Expone la API externa) -->
<FilterSelectRemote apiEndpoint="http://localhost:3333/attraction-status" ... />

<!-- AHORA (✅ Usa endpoint interno) -->
<FilterSelectRemote apiEndpoint="/api/attraction-status" ... />
```

## Cómo añadir un nuevo endpoint proxy

1. **Crear la carpeta del endpoint**:

   ```bash
   mkdir -p src/routes/api/tu-endpoint
   ```

2. **Crear el archivo `+server.ts`**:

   ```typescript
   import { json } from '@sveltejs/kit';
   import { apiClient } from '$lib/api/client';
   import { ApiError } from '$lib/api/errors';
   import type { RequestHandler } from './$types';

   export const GET: RequestHandler = async ({ fetch }) => {
   	try {
   		const response = await apiClient.request(fetch, '/tu-endpoint-en-api-externa');
   		return json(response.data);
   	} catch (error) {
   		if (error instanceof ApiError) {
   			return json({ error: error.message }, { status: error.status || 500 });
   		}
   		return json({ error: 'Internal server error' }, { status: 500 });
   	}
   };
   ```

3. **Usar en tu componente**:
   ```svelte
   <FilterSelectRemote apiEndpoint="/api/tu-endpoint" ... />
   ```

## Catálogo automático

✨ **Todos los endpoints proxy aparecen automáticamente en el catálogo de API** (`/api-catalog`)

El sistema escanea esta carpeta y extrae información de los comentarios JSDoc para mostrar:

- Método HTTP (GET, POST, etc.)
- Path interno (`/api/endpoint-name`)
- Path externo (endpoint de la API externa)
- Descripción del endpoint

**Formato recomendado de comentarios JSDoc:**

```typescript
/**
 * API Proxy Endpoint: [Nombre descriptivo]
 *
 * [Descripción del propósito del endpoint]
 *
 * Endpoint externo: GET /path-en-api-externa
 * Endpoint interno: GET /api/path-interno
 */
```

## Notas importantes

- Estos endpoints **NO** son para operaciones CRUD normales (crear, actualizar, eliminar)
- Solo para datos que necesitan cargarse asíncronamente desde el cliente
- Para operaciones normales, usa `+page.server.ts` con el `load()` function
- Todos los endpoints reutilizan el `apiClient` de `$lib/api` para consistencia
- Los endpoints se detectan automáticamente y aparecen en `/api-catalog`

## Configuración

La URL de la API externa se configura en `.env`:

```env
PUBLIC_API_BASE_URL=http://localhost:3333
```

Los endpoints proxy usan automáticamente esta configuración a través de `$lib/api/config.ts`.
