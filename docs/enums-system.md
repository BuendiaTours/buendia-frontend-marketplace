# Sistema de Enums Centralizados

Este documento explica cómo gestionar enums en la aplicación de forma centralizada, tipada y con soporte para internacionalización futura.

## Arquitectura del Sistema

### 1. Enums Auto-generados desde la API

**Archivo:** `src/lib/generated/enums.ts`

Este archivo se genera automáticamente desde la API y **NO debe editarse manualmente**.

**Estructura de cada enum:**

```typescript
// Array de valores (para validación Zod)
export const NOT_SUITABLE_FOR = [
	'ADULTS',
	'CHILDREN',
	'FAMILIES',
	'GROUPS',
	'INDIVIDUALS'
] as const;

// Tipo TypeScript derivado
export type NotSuitableFor = (typeof NOT_SUITABLE_FOR)[number];

// Opciones para selectores (id + name)
export const NOT_SUITABLE_FOR_OPTIONS = [
	{ id: 'ADULTS', name: 'Adultos' },
	{ id: 'CHILDREN', name: 'Niños' },
	{ id: 'FAMILIES', name: 'Familias' },
	{ id: 'GROUPS', name: 'Grupos' },
	{ id: 'INDIVIDUALS', name: 'Individuales' }
];

// Mapa para acceso directo (con descripción)
export const NOT_SUITABLE_FOR_MAP = {
	ADULTS: { id: 'ADULTS', name: 'Adultos', description: 'No recomendado para adultos' },
	CHILDREN: { id: 'CHILDREN', name: 'Niños', description: 'No recomendado para niños' }
	// ...
} as const;
```

### 2. Script de Generación

**Archivo:** `scripts/generate-enums.ts`

**Comando:** `npm run generate:enums`

Este script:

1. Conecta con la API (usando `PUBLIC_API_BASE_URL` del `.env`)
2. Obtiene todos los enums de los endpoints configurados
3. Genera el archivo `src/lib/generated/enums.ts`

**Añadir un nuevo enum:**

```typescript
// En scripts/generate-enums.ts
const [
	stageKinds,
	stageRelevances,
	stageRequirements,
	activityStatuses,
	notSuitableFor,
	nuevoEnum // ← Añadir aquí
] = await Promise.all([
	fetchEnum('/stage-kinds'),
	fetchEnum('/stage-relevances'),
	fetchEnum('/stage-requirements'),
	fetchEnum('/activity-status'),
	fetchEnum('/not-suitable-for'),
	fetchEnum('/nuevo-enum-endpoint') // ← Endpoint de la API
]);
```

Luego añadir la sección de generación en el template del contenido.

## Uso en la Aplicación

### 1. En Schemas de Validación (Zod)

```typescript
import { z } from 'zod';

export const activityFormSchema = z.object({
	// Usar el array de valores para validación
	notSuitableFor: z
		.array(z.enum(['ADULTS', 'CHILDREN', 'FAMILIES', 'GROUPS', 'INDIVIDUALS']))
		.default([]),

	// O importar desde el enum generado
	status: z.enum(ACTIVITY_STATUSES)
});
```

### 2. En Tipos TypeScript

```typescript
import type { NotSuitableFor } from '$lib/generated/enums';

export type ActivityListItem = {
	id: string;
	title: string;
	// Usar el tipo generado
	notSuitableFor: NotSuitableFor[];
	// O definir inline
	notSuitableFor: Array<'ADULTS' | 'CHILDREN' | 'FAMILIES' | 'GROUPS' | 'INDIVIDUALS'>;
};
```

### 3. En Componentes de Formulario

#### FormCheckboxGroup (Múltiple selección)

```svelte
<script lang="ts">
	import { NOT_SUITABLE_FOR_OPTIONS } from '$lib/generated/enums';
	import FormCheckboxGroup from '$lib/components/forms/FormCheckboxGroup.svelte';

	const { form, errors } = superForm(data.form);
</script>

<FormCheckboxGroup
	id="notSuitableFor"
	label="No recomendado para"
	bind:value={$form.notSuitableFor}
	options={NOT_SUITABLE_FOR_OPTIONS}
	error={$errors.notSuitableFor}
/>
```

#### FormSelect (Selección única)

```svelte
<script lang="ts">
	import { ACTIVITY_STATUSES_OPTIONS } from '$lib/generated/enums';
	import FormSelect from '$lib/components/forms/FormSelect.svelte';
</script>

<FormSelect
	id="status"
	label="Estado"
	bind:value={$form.status}
	options={ACTIVITY_STATUSES_OPTIONS}
	error={$errors.status}
/>
```

### 4. Acceso a Información del Enum

```typescript
import { NOT_SUITABLE_FOR_MAP } from '$lib/generated/enums';

// Obtener nombre traducido
const nombre = NOT_SUITABLE_FOR_MAP.ADULTS.name; // "Adultos"

// Obtener descripción
const descripcion = NOT_SUITABLE_FOR_MAP.ADULTS.description; // "No recomendado para adultos"

// Verificar si un valor es válido
const esValido = 'ADULTS' in NOT_SUITABLE_FOR_MAP; // true
```

## Internacionalización Futura

El sistema está preparado para internacionalización:

### Estructura Actual (Español)

```typescript
export const NOT_SUITABLE_FOR_OPTIONS = [{ id: 'ADULTS', name: 'Adultos' }];
```

### Estructura Futura (Multi-idioma)

**Opción A: Función de traducción**

```typescript
import { t } from '$lib/i18n';

export const NOT_SUITABLE_FOR_OPTIONS = [{ id: 'ADULTS', name: t('enums.notSuitableFor.adults') }];
```

**Opción B: Claves de traducción**

```typescript
export const NOT_SUITABLE_FOR_OPTIONS = [
  { "id": "ADULTS", "nameKey": "enums.notSuitableFor.adults" }
];

// En el componente
<FormCheckboxGroup
  options={NOT_SUITABLE_FOR_OPTIONS.map(opt => ({
    id: opt.id,
    name: t(opt.nameKey)
  }))}
/>
```

**Opción C: Archivo de traducciones separado**

```typescript
// src/lib/i18n/enums/es.ts
export const enumTranslations = {
	NOT_SUITABLE_FOR: {
		ADULTS: 'Adultos',
		CHILDREN: 'Niños'
		// ...
	}
};

// src/lib/i18n/enums/en.ts
export const enumTranslations = {
	NOT_SUITABLE_FOR: {
		ADULTS: 'Adults',
		CHILDREN: 'Children'
		// ...
	}
};
```

## Enums Disponibles

### STAGE_KINDS

- **Valores:** `TRANSFER`, `EXPERIENCE`
- **Uso:** Tipo de etapa en una actividad
- **Componente:** FormSelect

### STAGE_RELEVANCES

- **Valores:** `HIGH`, `MEDIUM`, `LOW`, `NONE`
- **Uso:** Relevancia de una etapa
- **Componente:** FormSelect

### STAGE_REQUIREMENTS

- **Valores:** `REQUIRED`, `OPTIONAL`, `SUGGESTED`, `NONE`
- **Uso:** Requisito de una etapa
- **Componente:** FormSelect

### ACTIVITY_STATUSES

- **Valores:** `APPROVED`, `DELETED`, `DRAFT`, `PENDING_REVIEW`, `PUBLISHED`, `REJECTED`, `UNPUBLISHED`
- **Uso:** Estado de una actividad
- **Componente:** FormSelect

### NOT_SUITABLE_FOR

- **Valores:** `ADULTS`, `CHILDREN`, `FAMILIES`, `GROUPS`, `INDIVIDUALS`
- **Uso:** Tipos de público para los que NO es recomendada la actividad
- **Componente:** FormCheckboxGroup (múltiple selección)

## Añadir un Nuevo Enum

### 1. Asegurar que existe en la API

El endpoint debe devolver un array de objetos con esta estructura:

```json
[
	{
		"id": "VALOR_1",
		"name": "Nombre traducido",
		"description": "Descripción opcional"
	}
]
```

### 2. Actualizar el script de generación

```typescript
// scripts/generate-enums.ts

// Añadir a la lista de fetch
const [..., nuevoEnum] = await Promise.all([
  // ...
  fetchEnum('/nuevo-enum-endpoint')
]);

// Añadir al log
console.log(`✅ Nuevo Enum: ${nuevoEnum.length} items`);

// Añadir al template de contenido
const content = `
// ...

// ============================================================================
// NUEVO ENUM
// ============================================================================

export const NUEVO_ENUM = ${JSON.stringify(
  nuevoEnum.map((n) => n.id),
  null,
  2
)} as const;

export type NuevoEnum = (typeof NUEVO_ENUM)[number];

export const NUEVO_ENUM_OPTIONS = ${JSON.stringify(
  nuevoEnum.map((n) => ({ id: n.id, name: n.name })),
  null,
  2
)};

export const NUEVO_ENUM_MAP = {
${nuevoEnum.map((n) => `\t${n.id}: ${JSON.stringify(n)}`).join(',\n')}
} as const;
`;

// Añadir al summary
console.log(`   - Nuevo Enum: ${nuevoEnum.map((n) => n.id).join(', ')}`);
```

### 3. Ejecutar el script

```bash
npm run generate:enums
```

### 4. Usar en la aplicación

```typescript
// En schema
import { NUEVO_ENUM } from '$lib/generated/enums';

export const schema = z.object({
  campo: z.enum(NUEVO_ENUM)
});

// En componente
import { NUEVO_ENUM_OPTIONS } from '$lib/generated/enums';

<FormSelect options={NUEVO_ENUM_OPTIONS} />
```

## Ventajas del Sistema

✅ **Centralizado**: Un solo lugar para todos los enums
✅ **Tipado**: TypeScript garantiza type-safety
✅ **Auto-generado**: Sincronizado con la API
✅ **Reutilizable**: Mismo enum en schemas, tipos y componentes
✅ **Preparado para i18n**: Estructura lista para traducciones
✅ **Mantenible**: Cambios en API se reflejan ejecutando script
✅ **Documentado**: Cada enum tiene nombre y descripción

## Ejemplo Completo: notSuitableFor

### 1. Enum generado

```typescript
// src/lib/generated/enums.ts (auto-generado)
export const NOT_SUITABLE_FOR = [
	'ADULTS',
	'CHILDREN',
	'FAMILIES',
	'GROUPS',
	'INDIVIDUALS'
] as const;
export type NotSuitableFor = (typeof NOT_SUITABLE_FOR)[number];
export const NOT_SUITABLE_FOR_OPTIONS = [
	{ id: 'ADULTS', name: 'Adultos' },
	{ id: 'CHILDREN', name: 'Niños' },
	{ id: 'FAMILIES', name: 'Familias' },
	{ id: 'GROUPS', name: 'Grupos' },
	{ id: 'INDIVIDUALS', name: 'Individuales' }
];
```

### 2. Schema de validación

```typescript
// src/routes/(backoffice)/activities/activity-form.schema.ts
export const activityFormSchema = z.object({
	notSuitableFor: z
		.array(z.enum(['ADULTS', 'CHILDREN', 'FAMILIES', 'GROUPS', 'INDIVIDUALS']))
		.default([])
});
```

### 3. Tipo TypeScript

```typescript
// src/lib/types.ts
export type ActivityListItem = {
	notSuitableFor: Array<'ADULTS' | 'CHILDREN' | 'FAMILIES' | 'GROUPS' | 'INDIVIDUALS'>;
};
```

### 4. Componente de formulario

```svelte
<!-- src/routes/(backoffice)/activities/[slug]/edit/+page.svelte -->
<script lang="ts">
	import { NOT_SUITABLE_FOR_OPTIONS } from '$lib/generated/enums';
	import FormCheckboxGroup from '$lib/components/forms/FormCheckboxGroup.svelte';
</script>

<FormCheckboxGroup
	id="notSuitableFor"
	label="No recomendado para"
	bind:value={$form.notSuitableFor}
	options={NOT_SUITABLE_FOR_OPTIONS}
	error={$errors.notSuitableFor}
	badge="Selecciona los tipos de público para los que NO es recomendada esta actividad"
/>
```

## Troubleshooting

### El script falla al conectar con la API

**Error:** `Error fetching /not-suitable-for: HTTP error! status: 404`

**Solución:** Verificar que el endpoint existe en la API y que `PUBLIC_API_BASE_URL` en `.env` es correcto.

### Los cambios no se reflejan

**Problema:** Actualicé la API pero los enums no cambian.

**Solución:** Ejecutar `npm run generate:enums` para regenerar el archivo.

### Error de tipo en el formulario

**Error:** `Type 'string[]' is not assignable to type 'NotSuitableFor[]'`

**Solución:** Asegurar que el schema Zod y el tipo TypeScript usan los mismos valores del enum.
