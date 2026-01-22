# Internacionalización con Paraglide JS

Sistema de internacionalización usando [Paraglide JS](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) - Una solución type-safe y de alto rendimiento para SvelteKit.

## ¿Qué es Paraglide?

Paraglide JS es una librería de i18n que:

- ✅ **Compila traducciones en tiempo de build** (mejor rendimiento)
- ✅ **Type-safe completo** con autocompletado
- ✅ **Tree-shakeable** (solo incluye traducciones usadas)
- ✅ **Sin runtime overhead** (traducciones compiladas)
- ✅ **Integración con herramientas de traducción** (Inlang)

## Estructura del proyecto

```
project.inlang/
├── settings.json       # Configuración de idiomas y plugins
└── .meta.json         # Metadata del proyecto

messages/
└── es.json            # Traducciones en español

src/paraglide/         # Archivos generados automáticamente
├── messages.js        # Funciones de traducción
├── runtime.js         # Runtime de Paraglide
└── ...               # Otros archivos generados
```

## Uso básico

### 1. Importar las traducciones

```svelte
<script lang="ts">
	import * as m from '$paraglide/messages';
</script>
```

### 2. Usar traducciones en el template

Las traducciones son **funciones** que retornan strings:

```svelte
<h1>{m.activities_title()}</h1>

<button>
	{m.activities_newActivity()}
</button>

<span>{m.common_cancel()}</span>
```

### 3. Traducciones con parámetros (futuro)

Paraglide soporta interpolación de variables:

```json
{
	"welcome_message": "Hola {name}, tienes {count} mensajes"
}
```

```svelte
<p>{m.welcome_message({ name: 'Carlos', count: 5 })}</p>
```

## Añadir nuevas traducciones

### 1. Editar el archivo de mensajes

Edita `/messages/es.json`:

```json
{
	"$schema": "https://inlang.com/schema/inlang-message-format",
	"miModulo_miMensaje": "Mi mensaje traducido",
	"miModulo_otroMensaje": "Otro mensaje"
}
```

**Convención de nombres:**

- Usa `snake_case` para las claves
- Usa `_` para separar módulos: `modulo_submodulo_clave`
- Ejemplo: `activities_filters_today`

### 2. Compilar las traducciones

Las traducciones se compilan automáticamente cuando:

- Ejecutas `npm run dev`
- Ejecutas `npm run build`
- Guardas cambios en archivos de mensajes (en dev mode)

También puedes compilar manualmente:

```bash
npx @inlang/paraglide-js compile --project ./project.inlang
```

### 3. Usar la nueva traducción

```svelte
<script>
	import * as m from '$paraglide/messages';
</script>

<span>{m.miModulo_miMensaje()}</span>
```

## Añadir un nuevo idioma

### 1. Actualizar configuración

Edita `/project.inlang/settings.json`:

```json
{
	"baseLocale": "es",
	"locales": ["es", "en"]
}
```

### 2. Crear archivo de traducciones

Crea `/messages/en.json` con las mismas claves:

```json
{
	"$schema": "https://inlang.com/schema/inlang-message-format",
	"activities_title": "Activities",
	"activities_newActivity": "New activity",
	"common_cancel": "Cancel"
}
```

### 3. Cambiar el idioma (cuando se implemente un selector)

```typescript
import { setLanguageTag } from '$paraglide/runtime';

// Cambiar a inglés
setLanguageTag('en');

// Cambiar a español
setLanguageTag('es');
```

### Sherlock VSCode Extension

Paraglide recomienda instalar la extensión Sherlock para VSCode/Cursor:

- **Inline translations**: Ve las traducciones directamente en el código
- **Quick edit**: Edita traducciones sin salir del editor
- **Missing translations**: Detecta traducciones faltantes
- **Autocompletado mejorado**: Sugerencias contextuales

Instalar desde: [Sherlock Extension](https://marketplace.visualstudio.com/items?itemName=inlang.vs-code-extension)

### Inlang Editor Web

Editor visual para gestionar traducciones:

```bash
npx @inlang/cli editor
```

Abre un editor web donde puedes:

- Ver todas las traducciones
- Editar traducciones visualmente
- Detectar traducciones faltantes
- Exportar/importar traducciones

## Ejemplo completo

```svelte
<script lang="ts">
	import * as m from '$paraglide/messages';
	import { Plus } from 'svelte-iconoir';

	let items = $state([]);
</script>

<div>
	<h1>{m.activities_title()}</h1>

	{#if items.length === 0}
		<p>{m.activities_noActivities()}</p>
	{/if}

	<button class="btn btn-primary">
		<Plus />
		<span>{m.activities_newActivity()}</span>
	</button>

	<div class="filters">
		<span>{m.activities_filters_today()}</span>
		<span>{m.activities_filters_thisWeek()}</span>
		<button>{m.common_clear()}</button>
	</div>
</div>
```

## Buenas prácticas

1. **Nombres descriptivos**: Usa nombres claros que describan el contenido
2. **Organización jerárquica**: Agrupa por módulo usando `_`
3. **Consistencia**: Mantén la misma estructura en todos los idiomas
4. **Traducciones completas**: Asegúrate de traducir todas las claves
5. **Evita hardcoding**: Siempre usa funciones de mensaje, no strings directos

## Comandos útiles

```bash
# Compilar traducciones manualmente
npx @inlang/paraglide-js compile --project ./project.inlang

# Abrir editor de traducciones
npx @inlang/cli editor

# Validar traducciones
npx @inlang/cli validate
```

## Próximos pasos

- [ ] Migrar todos los literales hardcodeados a Paraglide
- [ ] Añadir soporte para inglés
- [ ] Implementar selector de idioma en el header
- [ ] Configurar persistencia del idioma (localStorage)
- [ ] Añadir traducciones con parámetros donde sea necesario
- [ ] Configurar rutas localizadas (opcional)

## Referencias

- [Documentación oficial de Paraglide](https://inlang.com/m/gerre34r/library-inlang-paraglideJs)
- [Guía de SvelteKit con Paraglide](https://inlang.com/m/gerre34r/library-inlang-paraglideJs/sveltekit)
- [Inlang Ecosystem](https://inlang.com/)
