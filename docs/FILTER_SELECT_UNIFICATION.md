# FilterSelect - Unificación de Componentes de Filtros

**Fecha:** 2026-02-06  
**Objetivo:** Unificar `FilterSelectQuery` y `FilterSelectRemote` en un solo componente flexible

---

## Problema Original

Teníamos **2 componentes** para casos muy similares:

### `FilterSelectRemote.svelte` (88 líneas)

- Fetch manual en `onMount()` desde un `apiEndpoint` (string)
- Maneja `options` en estado local
- Sin loading/error states visibles

### `FilterSelectQuery.svelte` (109 líneas)

- Remote Function con `{#each await queryFunction()}`
- No necesita manejar `options` (lazy loading)
- Loading manejado automáticamente

**Problemas:**

- ❌ Duplicación de código (UI idéntica)
- ❌ Cambios en UI requieren tocar 2 archivos
- ❌ Confusión sobre cuál usar

---

## Solución: Componente Unificado

### `FilterSelect.svelte` (Nuevo)

Un solo componente que soporta **3 modos**:

```typescript
type OptionsSource =
  | { type: 'static'; options: Option[] }                          // 1. Array local
  | { type: 'remote'; queryFunction: RemoteQueryFunction<...> }    // 2. Remote Function (recomendado)
  | { type: 'endpoint'; apiEndpoint: string };                     // 3. Fetch manual (legacy)
```

---

## Uso

### Modo 1: Remote Function (⭐ Recomendado)

```svelte
<script>
	import FilterSelect from '$lib/components/filters/FilterSelect.svelte';
	import { getDestinationKinds } from '$lib/api/common.remote';
</script>

<FilterSelect
	source={{ type: 'remote', queryFunction: getDestinationKinds }}
	filterKey="kind"
	currentValue={filters.kind}
	placeholder="Tipo de destino"
	{onFilterChange}
/>
```

**Ventajas:**

- ✅ Type-safe
- ✅ Menos código
- ✅ Loading automático
- ✅ Ejecuta en el servidor

### Modo 2: Opciones estáticas

```svelte
<script>
	const statusOptions = [
		{ id: 'ACTIVE', name: 'Activo' },
		{ id: 'INACTIVE', name: 'Inactivo' }
	];
</script>

<FilterSelect
	source={{ type: 'static', options: statusOptions }}
	filterKey="status"
	currentValue={filters.status}
	{onFilterChange}
/>
```

**Ventajas:**

- ✅ No requiere fetch
- ✅ Ideal para enums pequeños
- ✅ Datos conocidos en compile-time

### Modo 3: Endpoint (Legacy)

```svelte
<FilterSelect
	source={{ type: 'endpoint', apiEndpoint: '/api/destination-kind' }}
	filterKey="kind"
	currentValue={filters.kind}
	{onFilterChange}
/>
```

**Uso:** Solo para código legacy durante migración gradual.

---

## Migración Realizada

### Archivos Modificados

1. **`src/routes/(backoffice)/destinations/+page.svelte`**
   - ✅ Migrado de `FilterSelectQuery` a `FilterSelect` con modo `remote`

2. **`src/routes/(backoffice)/attractions/+page.svelte`**
   - ✅ Migrado de `FilterSelectQuery` a `FilterSelect` con modo `remote`

### Archivos Eliminados

- ❌ `src/lib/components/filters/FilterSelectQuery.svelte`
- ❌ `src/lib/components/filters/FilterSelectRemote.svelte`

### Archivos Creados

- ✅ `src/lib/components/filters/FilterSelect.svelte` (componente unificado)

---

## Beneficios

### Antes (2 componentes)

```
FilterSelectRemote.svelte (88 líneas)
  - Fetch manual en onMount
  - Sin loading states
  - Maneja options en estado

FilterSelectQuery.svelte (109 líneas)
  - Remote Functions
  - Loading automático
  - Sin manejo de options

Total: 197 líneas + mantenimiento duplicado
```

### Ahora (1 componente)

```
FilterSelect.svelte (221 líneas)
  - Soporta 3 modos
  - Loading automático (remote)
  - Flexible y extensible

Total: 221 líneas + 1 solo punto de mantenimiento
```

**Métricas:**

- ✅ **-1 componente** → Menos superficie de mantenimiento
- ✅ **1 solo punto de cambio** → Cambios en UI más fáciles
- ✅ **Union Types** → Type-safety mejorado
- ✅ **Documentación completa** → Ejemplos en el propio componente

---

## Recomendaciones Futuras

### Priorizar Remote Functions

Para nuevos filtros, usar siempre el modo `remote`:

```typescript
// 1. Crear Remote Function en common.remote.ts
export const getNewFilterOptions = query(async () => {
  const response = await apiClient.request(fetch, '/new-filter-options');
  return response.data;
});

// 2. Usar en componente
<FilterSelect
  source={{ type: 'remote', queryFunction: getNewFilterOptions }}
  ...
/>
```

### Migración Gradual del Modo `endpoint`

Si encuentras código legacy usando fetch manual:

1. Crear Remote Function correspondiente
2. Cambiar a modo `remote`
3. Eliminar endpoint `/api/*` si existe

### Deprecar modo `endpoint`

Una vez todo migrado a Remote Functions, podemos simplificar:

```typescript
// Futuro: Solo 2 modos
type OptionsSource =
  | { type: 'static'; options: Option[] }
  | { type: 'remote'; queryFunction: RemoteQueryFunction<...> };
```

---

## Testing

✅ **Type-check:** `npm run check` → Sin nuevos errores  
✅ **Usos migrados:** 2 páginas (destinations, attractions)  
✅ **Sin referencias antiguas:** Grep muestra solo archivos eliminados  
✅ **Build:** El componente compila correctamente

---

## Referencias

- **Componente:** `src/lib/components/filters/FilterSelect.svelte`
- **Documentación interna:** Ver JSDoc en el componente
- **Remote Functions:** `src/lib/api/common.remote.ts`
- **Docs de Remote Functions:** `src/routes/api/README.md`

---

**Autor:** OpenCode AI  
**Revisión recomendada:** Testing manual en dev server (`npm run dev`)
