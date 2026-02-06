# API Directory

Este directorio está reservado para endpoints HTTP tradicionales que necesiten ser accesibles públicamente o por servicios externos (webhooks, integraciones de terceros, etc.).

## 🎯 Cuándo Usar Este Directorio

Crea endpoints aquí solo para:

1. **Webhooks**: Endpoints que reciben notificaciones de servicios externos (Stripe, PayPal, etc.)
2. **Integraciones Públicas**: APIs que necesitan ser consumidas por sistemas externos
3. **Endpoints de Autenticación OAuth**: Callbacks de proveedores de identidad externos

## ❌ NO Usar Para

Para comunicación **interna** entre componentes y servidor, usa **Remote Functions** en lugar de crear endpoints HTTP manualmente.

---

## ⚠️ Migración: API Proxies → Remote Functions

Los antiguos endpoints proxy (`/api/destination-kind`, `/api/attraction-status`) fueron **reemplazados por Remote Functions** en favor de:

- ✅ Type-safety automático
- ✅ Menos boilerplate
- ✅ Mejor experiencia de desarrollo

### Antes (API Proxies) ❌

```
Component → fetch('/api/destination-kind') → +server.ts → API Externa
```

### Ahora (Remote Functions) ✅

```
Component → await getDestinationKinds() → common.remote.ts → API Externa
```

---

## Remote Functions (Enfoque Recomendado)

### ¿Qué son?

Remote Functions permiten llamar funciones del servidor directamente desde componentes, con type-safety completo y sin crear endpoints HTTP manualmente.

### Ventajas

✅ **Type-Safety Automático**: Los tipos fluyen del servidor al cliente  
✅ **Menos Código**: No necesitas crear archivos `+server.ts`  
✅ **Declarativo**: Usa `{#each await queryFunction()}` directamente  
✅ **Batching**: Agrupa múltiples queries automáticamente (`query.batch`)  
✅ **Caché**: Las queries se cachean mientras estén en la página  
✅ **Error Handling**: Integrado con `ApiClient` (retry, timeout, etc.)

### Ejemplo Completo

#### 1. Definir Remote Function

```typescript
// src/lib/api/common.remote.ts
import { query } from '$app/server';
import { apiClient } from './client';

export const getDestinationKinds = query(async () => {
	const response = await apiClient.request(fetch, '/destination-kind');
	return response.data;
});
```

#### 2. Usar en Componente

```svelte
<script lang="ts">
  import { getDestinationKinds } from '$lib/api/common.remote';
</script>

<!-- Forma 1: Con await (recomendado) -->
{#each await getDestinationKinds() as kind}
  <option value={kind.id}>{kind.name}</option>
{/each}

<!-- Forma 2: Con .current, .loading, .error -->
<script>
  const query = getDestinationKinds();
</script>

{#if query.loading}
  <p>Cargando...</p>
{:else if query.error}
  <p>Error: {query.error.message}</p>
{:else}
  {#each query.current as kind}
    <option value={kind.id}>{kind.name}</option>
  {/each}
{/if}
```

### Configuración Requerida

Asegúrate de tener estas opciones habilitadas en `svelte.config.js`:

```javascript
export default {
	kit: {
		experimental: {
			remoteFunctions: true
		}
	},
	compilerOptions: {
		experimental: {
			async: true // Para usar await en templates
		}
	}
};
```

### Remote Functions Disponibles

Ver: `src/lib/api/common.remote.ts`

| Función                   | Descripción                  | Endpoint Externo     |
| ------------------------- | ---------------------------- | -------------------- |
| `getDestinationKinds()`   | Tipos de destino disponibles | `/destination-kind`  |
| `getAttractionStatuses()` | Estados de atracciones       | `/attraction-status` |

### Componentes

- ✅ `FilterSelectQuery.svelte` - Selector de filtros con Remote Functions (nuevo)
- ⚠️ `FilterSelectRemote.svelte` - Deprecado (usa fetch a `/api/*`)

---

## Cómo Agregar Nuevas Remote Functions

### 1. Añadir la función en `common.remote.ts`

```typescript
export const getTuNuevaQuery = query(async () => {
	const response = await apiClient.request(fetch, '/tu-endpoint');
	return response.data;
});
```

### 2. Usar en tu componente

```svelte
<script>
	import { getTuNuevaQuery } from '$lib/api/common.remote';
</script>

{#each await getTuNuevaQuery() as item}
	<div>{item.name}</div>
{/each}
```

### 3. Con validación (schemas)

Si tu query acepta parámetros, puedes validarlos con Zod o Valibot:

```typescript
import * as v from 'valibot';

export const buscarActividades = query(
	v.string(), // Schema para validar el input
	async (query: string) => {
		const response = await apiClient.request(fetch, `/activities/search?q=${query}`);
		return response.data;
	}
);
```

Uso:

```svelte
{#each await buscarActividades('playa') as activity}
	<div>{activity.title}</div>
{/each}
```

---

## Remote Forms (Bonus)

Para formularios, también puedes usar `form()`:

```typescript
import { form } from '$app/server';
import * as v from 'valibot';

export const crearDestino = form(
	v.object({
		nombre: v.string(),
		tipo: v.picklist(['CITY', 'COUNTRY', 'REGION'])
	}),
	async (data) => {
		const response = await apiClient.request(fetch, '/destinations', {
			method: 'POST',
			body: JSON.stringify(data)
		});
		redirect(303, `/destinations/${response.data.slug}`);
	}
);
```

Uso:

```svelte
<form {...crearDestino}>
	<input {...crearDestino.fields.nombre.as('text')} />
	<select {...crearDestino.fields.tipo.as('select')}>
		<option>CITY</option>
		<option>COUNTRY</option>
	</select>
	<button>Crear</button>
</form>
```

---

## Más Información

- [Documentación oficial de Remote Functions](https://svelte.dev/docs/kit/remote-functions)
- [API Catalog](/api-catalog) - Catálogo completo de endpoints
- Ejemplos: `src/lib/api/common.remote.ts`
- Componentes: `src/lib/components/filters/FilterSelectQuery.svelte`

---

## TL;DR

| Necesitas...                  | Usa...                                 |
| ----------------------------- | -------------------------------------- |
| Datos internos en componentes | Remote Functions (`*.remote.ts`)       |
| Webhooks externos             | Endpoints tradicionales (`+server.ts`) |
| OAuth callbacks               | Endpoints tradicionales (`+server.ts`) |
| APIs públicas                 | Endpoints tradicionales (`+server.ts`) |

**Regla de oro**: Si es interno, usa Remote Functions. Si es externo, usa `+server.ts`.
