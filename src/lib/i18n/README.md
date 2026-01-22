# Sistema de Internacionalización (i18n)

Sistema simple y efectivo de internacionalización para la aplicación SvelteKit.

## Estructura de archivos

```
src/lib/i18n/
├── index.ts          # Store y helpers principales
├── es.ts             # Traducciones en español
└── README.md         # Esta documentación
```

## Uso básico

### 1. Importar el store de traducciones

```svelte
<script lang="ts">
	import { t } from '$lib/i18n';
</script>
```

### 2. Usar traducciones en el template

El store `t` es reactivo y se actualiza automáticamente cuando cambia el idioma:

```svelte
<button>
	{$t.activities.newActivity}
</button>

<h1>{$t.activities.title}</h1>

<span>{$t.common.cancel}</span>
```

### 3. Acceso a traducciones anidadas

Las traducciones están organizadas jerárquicamente:

```svelte
{$t.activities.filters.today}
{$t.activities.table.title}
{$t.activities.pagination.page}
```

## Añadir nuevas traducciones

### 1. Editar el archivo de idioma (`es.ts`)

```typescript
export const es = {
  common: {
    // ... traducciones comunes
  },
  miModulo: {
    titulo: 'Mi Título',
    descripcion: 'Mi descripción',
    botones: {
      guardar: 'Guardar',
      cancelar: 'Cancelar'
    }
  }
} as const;
```

### 2. Actualizar el tipo `TranslationPath` en `index.ts`

Para obtener autocompletado en el IDE, añade el nuevo módulo al tipo:

```typescript
export type TranslationPath =
  | `common.${keyof typeof es.common}`
  | `activities.${keyof typeof es.activities}`
  | `miModulo.${keyof typeof es.miModulo}`
  | `miModulo.botones.${keyof typeof es.miModulo.botones}`;
```

## Añadir un nuevo idioma

### 1. Crear archivo de traducciones

Crea un nuevo archivo `en.ts` (inglés) siguiendo la misma estructura:

```typescript
export const en = {
  common: {
    cancel: 'Cancel',
    confirm: 'Confirm',
    // ...
  },
  activities: {
    title: 'Activities',
    newActivity: 'New activity',
    // ...
  }
} as const;
```

### 2. Registrar el idioma en `index.ts`

```typescript
import { es } from './es';
import { en } from './en';

const translations = {
  es,
  en
} as const;
```

### 3. Cambiar el idioma

```typescript
import { setLocale } from '$lib/i18n';

// Cambiar a inglés
setLocale('en');

// Cambiar a español
setLocale('es');
```

## Ventajas de este sistema

- ✅ **Simple**: No requiere librerías externas
- ✅ **Type-safe**: TypeScript valida las claves de traducción
- ✅ **Reactivo**: Usa stores de Svelte nativos
- ✅ **Autocompletado**: El IDE sugiere las claves disponibles
- ✅ **Ligero**: Sin dependencias adicionales
- ✅ **Escalable**: Fácil añadir nuevos idiomas y traducciones

## Ejemplo completo

```svelte
<script lang="ts">
	import { t, setLocale } from '$lib/i18n';

	function cambiarIdioma() {
		setLocale('en'); // Cambiar a inglés (cuando esté disponible)
	}
</script>

<div>
	<h1>{$t.activities.title}</h1>

	<button on:click={cambiarIdioma}> Change language </button>

	<button class="btn btn-primary">
		{$t.activities.newActivity}
	</button>

	<p>{$t.activities.noActivities}</p>
</div>
```

## Buenas prácticas

1. **Organización jerárquica**: Agrupa traducciones por módulo/página
2. **Nombres descriptivos**: Usa nombres claros para las claves
3. **Consistencia**: Mantén la misma estructura en todos los idiomas
4. **Traducciones completas**: Asegúrate de traducir todas las claves en todos los idiomas
5. **Evitar interpolación compleja**: Para textos con variables, considera usar funciones helper

## Próximos pasos

- [ ] Añadir soporte para inglés (`en.ts`)
- [ ] Implementar detección automática del idioma del navegador
- [ ] Añadir persistencia del idioma seleccionado (localStorage)
- [ ] Crear componente selector de idioma
- [ ] Migrar todos los literales hardcodeados a traducciones
