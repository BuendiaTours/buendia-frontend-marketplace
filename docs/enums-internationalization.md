# Internacionalización de Enums con Paraglide

Este documento explica cómo internacionalizar los enums de la aplicación usando Paraglide.

## Respuesta Rápida

**Sí, los enums pueden internacionalizarse completamente con Paraglide.**

## Implementación

### 1. Estructura de Archivos

```
src/lib/config/enums.ts          # Enums con traducciones
messages/es.json                  # Traducciones en español
messages/en.json                  # Traducciones en inglés (futuro)
src/paraglide/messages/           # Generado automáticamente por Paraglide
```

### 2. Definición de Enums Internacionalizados

**Archivo:** `src/lib/config/enums.ts`

```typescript
import * as m from '$paraglide/messages';

export const STAGE_KINDS_OPTIONS = [
	{
		id: 'TRANSFER',
		name: m.enums_stageKinds_transfer_name(),
		description: m.enums_stageKinds_transfer_description()
	},
	{
		id: 'EXPERIENCE',
		name: m.enums_stageKinds_experience_name(),
		description: m.enums_stageKinds_experience_description()
	}
];
```

### 3. Archivo de Traducciones

**Archivo:** `messages/es.json`

```json
{
	"enums_stageKinds_transfer_name": "Transfer",
	"enums_stageKinds_transfer_description": "Movimiento entre puntos (bus, tren, coche, barco, etc.)",
	"enums_stageKinds_experience_name": "Experiencia",
	"enums_stageKinds_experience_description": "Experiencia (visita, comida, show, concierto, etc.)"
}
```

**Archivo:** `messages/en.json` (futuro)

```json
{
	"enums_stageKinds_transfer_name": "Transfer",
	"enums_stageKinds_transfer_description": "Movement between points (bus, train, car, boat, etc.)",
	"enums_stageKinds_experience_name": "Experience",
	"enums_stageKinds_experience_description": "Experience (visit, meal, show, concert, etc.)"
}
```

## Convención de Nomenclatura

### Patrón para Claves de Traducción

```
enums_{enumName}_{value}_{field}
```

**Ejemplos:**

- `enums_stageKinds_transfer_name`
- `enums_stageKinds_transfer_description`
- `enums_notSuitableFor_adults_name`
- `enums_notSuitableFor_adults_description`
- `enums_activityStatuses_published_name`
- `enums_activityStatuses_published_description`

### Estructura

1. **Prefijo:** `enums_` (identifica que es un enum)
2. **Nombre del enum:** `stageKinds`, `notSuitableFor`, etc. (camelCase)
3. **Valor:** `transfer`, `adults`, `published`, etc. (lowercase)
4. **Campo:** `name` o `description`

## Ejemplo Completo: NOT_SUITABLE_FOR

### 1. Definir el enum

```typescript
// src/lib/config/enums.ts
import * as m from '$paraglide/messages';

export const NOT_SUITABLE_FOR_OPTIONS = [
	{
		id: 'ADULTS',
		name: m.enums_notSuitableFor_adults_name(),
		description: m.enums_notSuitableFor_adults_description()
	},
	{
		id: 'CHILDREN',
		name: m.enums_notSuitableFor_children_name(),
		description: m.enums_notSuitableFor_children_description()
	},
	{
		id: 'FAMILIES',
		name: m.enums_notSuitableFor_families_name(),
		description: m.enums_notSuitableFor_families_description()
	},
	{
		id: 'GROUPS',
		name: m.enums_notSuitableFor_groups_name(),
		description: m.enums_notSuitableFor_groups_description()
	},
	{
		id: 'INDIVIDUALS',
		name: m.enums_notSuitableFor_individuals_name(),
		description: m.enums_notSuitableFor_individuals_description()
	}
];
```

### 2. Añadir traducciones (Español)

```json
{
	"enums_notSuitableFor_adults_name": "Adultos",
	"enums_notSuitableFor_adults_description": "No recomendado para adultos",
	"enums_notSuitableFor_children_name": "Niños",
	"enums_notSuitableFor_children_description": "No recomendado para niños",
	"enums_notSuitableFor_families_name": "Familias",
	"enums_notSuitableFor_families_description": "No recomendado para familias",
	"enums_notSuitableFor_groups_name": "Grupos",
	"enums_notSuitableFor_groups_description": "No recomendado para grupos",
	"enums_notSuitableFor_individuals_name": "Individuales",
	"enums_notSuitableFor_individuals_description": "No recomendado para personas individuales"
}
```

### 3. Añadir traducciones (Inglés)

```json
{
	"enums_notSuitableFor_adults_name": "Adults",
	"enums_notSuitableFor_adults_description": "Not recommended for adults",
	"enums_notSuitableFor_children_name": "Children",
	"enums_notSuitableFor_children_description": "Not recommended for children",
	"enums_notSuitableFor_families_name": "Families",
	"enums_notSuitableFor_families_description": "Not recommended for families",
	"enums_notSuitableFor_groups_name": "Groups",
	"enums_notSuitableFor_groups_description": "Not recommended for groups",
	"enums_notSuitableFor_individuals_name": "Individuals",
	"enums_notSuitableFor_individuals_description": "Not recommended for individuals"
}
```

## Uso en Componentes

Los enums internacionalizados se usan exactamente igual que antes:

```svelte
<script lang="ts">
	import { NOT_SUITABLE_FOR_OPTIONS } from '$lib/config/enums';
	import FormCheckboxGroup from '$lib/components/forms/FormCheckboxGroup.svelte';
</script>

<FormCheckboxGroup
	id="notSuitableFor"
	label="No recomendado para"
	bind:value={$form.notSuitableFor}
	options={NOT_SUITABLE_FOR_OPTIONS}
	error={$errors.notSuitableFor?._errors}
/>
```

**Nota:** Las traducciones se aplican automáticamente según el idioma activo en Paraglide.

## Cambio de Idioma

Cuando cambies el idioma de la aplicación, los enums se traducirán automáticamente:

```typescript
import { setLanguageTag } from '$paraglide/runtime';

// Cambiar a inglés
setLanguageTag('en');

// Los enums ahora mostrarán los textos en inglés
console.log(NOT_SUITABLE_FOR_OPTIONS[0].name); // "Adults" en lugar de "Adultos"
```

## Ventajas de este Enfoque

✅ **Centralizado**: Todas las traducciones en `messages/{locale}.json`
✅ **Type-safe**: Paraglide genera tipos TypeScript automáticamente
✅ **Reactivo**: Los cambios de idioma se reflejan automáticamente
✅ **Consistente**: Misma convención que el resto de la app
✅ **Escalable**: Fácil añadir nuevos idiomas
✅ **Sin duplicación**: Una sola fuente de verdad por idioma

## Comparación con Enums Auto-generados

### Enums desde API (`src/lib/generated/enums.ts`)

**Pros:**

- Sincronizados con el backend
- Generados automáticamente
- Incluyen descripciones del servidor

**Contras:**

- Las traducciones vienen del backend
- Requiere que el backend soporte i18n
- Menos control sobre las traducciones

### Enums Locales con Paraglide (`src/lib/config/enums.ts`)

**Pros:**

- Control total sobre las traducciones
- No depende del backend para i18n
- Integración nativa con Paraglide
- Traducciones reactivas

**Contras:**

- Requiere mantenimiento manual
- Posible desincronización con el backend

## Estrategia Híbrida (Recomendada)

1. **Usar enums auto-generados** para valores que vienen del backend
2. **Usar enums locales con Paraglide** para traducciones del frontend
3. **Crear función helper** que combine ambos:

```typescript
// src/lib/utils/enums.ts
import * as m from '$paraglide/messages';
import { STAGE_KINDS } from '$lib/generated/enums';

export function getStageKindOptions() {
	return STAGE_KINDS.map((kind) => ({
		id: kind,
		name: m[`enums_stageKinds_${kind.toLowerCase()}_name`](),
		description: m[`enums_stageKinds_${kind.toLowerCase()}_description`]()
	}));
}
```

## Regenerar Tipos de Paraglide

Después de añadir nuevas claves de traducción, Paraglide regenerará automáticamente los tipos al:

1. **Guardar el archivo** `messages/es.json`
2. **Ejecutar el dev server**: `npm run dev`
3. **Hacer build**: `npm run build`

Los tipos se generan en `src/paraglide/messages/` automáticamente.

## Añadir un Nuevo Idioma

### 1. Actualizar configuración

**Archivo:** `project.inlang/settings.json`

```json
{
	"baseLocale": "es",
	"locales": ["es", "en"]
	// ...
}
```

### 2. Crear archivo de traducciones

**Archivo:** `messages/en.json`

```json
{
	"$schema": "https://inlang.com/schema/inlang-message-format",
	"enums_stageKinds_transfer_name": "Transfer",
	"enums_stageKinds_transfer_description": "Movement between points (bus, train, car, boat, etc.)"
	// ... resto de traducciones
}
```

### 3. Paraglide regenerará los tipos automáticamente

## Troubleshooting

### Error: "Property 'enums_xxx' does not exist"

**Causa:** Paraglide aún no ha regenerado los tipos.

**Solución:**

1. Guardar `messages/es.json`
2. Reiniciar el dev server: `npm run dev`
3. Los tipos se generarán automáticamente

### Las traducciones no cambian

**Causa:** El idioma activo no ha cambiado.

**Solución:**

```typescript
import { setLanguageTag } from '$paraglide/runtime';
setLanguageTag('en');
```

### Falta una traducción

**Causa:** La clave no existe en el archivo de mensajes del idioma activo.

**Solución:**

1. Añadir la clave a `messages/{locale}.json`
2. Guardar y esperar a que Paraglide regenere los tipos

## Recursos

- [Paraglide Documentation](https://inlang.com/m/gerre34r/library-inlang-paraglideJs)
- [Inlang Message Format](https://inlang.com/m/reootnfj/plugin-inlang-messageFormat)
- Sistema de enums: `docs/enums-system.md`
