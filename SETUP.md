# Guía de Configuración: Proyecto SvelteKit desde Cero

Esta guía te ayudará a crear un proyecto SvelteKit similar a este, con TypeScript, Tailwind CSS, DaisyUI, Bits-UI y otras herramientas modernas.

## 📋 Requisitos Previos

- **Node.js** 18+ y npm/pnpm/yarn
- Editor de código (recomendado: VS Code con extensión Svelte)

---

## 🚀 Paso 1: Crear el Proyecto Base

```bash
# Crear nuevo proyecto SvelteKit
npx sv create my-project

# Durante la configuración, selecciona:
# - Template: SvelteKit minimal
# - TypeScript: Yes
# - Add type checking with Typescript: Yes
# - Select additional options:
#   ✓ Add ESLint for code linting
#   ✓ Add Prettier for code formatting
#   ✓ Add Vitest for unit testing (opcional)

cd my-project
npm install
```

---

## 🎨 Paso 2: Instalar Tailwind CSS v4

Tailwind CSS v4 usa un nuevo sistema de configuración basado en Vite.

```bash
npm install -D tailwindcss@next @tailwindcss/vite
```

### Configurar Vite

Edita `vite.config.ts`:

```typescript
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()]
});
```

### Crear archivo CSS base

Crea `src/routes/layout.css`:

```css
@import 'tailwindcss';
```

### Importar en el layout

Edita `src/routes/+layout.svelte`:

```svelte
<script lang="ts">
	import './layout.css';
</script>

<slot />
```

---

## 🌼 Paso 3: Instalar DaisyUI

DaisyUI proporciona componentes UI prediseñados sobre Tailwind.

```bash
npm install -D daisyui
```

### Configurar DaisyUI

Actualiza `src/routes/layout.css`:

```css
@import 'tailwindcss';
@plugin 'daisyui';
```

### Configuración opcional de DaisyUI

Si necesitas personalizar temas, crea `daisyui.config.js` en la raíz:

```javascript
export default {
	themes: ['light', 'dark', 'cupcake'],
	darkTheme: 'dark',
	base: true,
	styled: true,
	utils: true
};
```

Y actualiza `layout.css`:

```css
@import 'tailwindcss';
@plugin 'daisyui' {
	config: './daisyui.config.js';
}
```

---

## 🧩 Paso 4: Instalar Bits-UI

Bits-UI proporciona componentes headless (sin estilos) más complejos.

```bash
npm install bits-ui
```

### Instalar dependencias de fecha (para calendarios)

```bash
npm install @internationalized/date
```

### Ejemplo de uso

```svelte
<script lang="ts">
	import { Popover } from 'bits-ui';
</script>

<Popover.Root>
	<Popover.Trigger class="btn">Abrir</Popover.Trigger>
	<Popover.Content class="rounded-box bg-base-100 p-4 shadow-lg">
		Contenido del popover
	</Popover.Content>
</Popover.Root>
```

---

## 🎭 Paso 5: Instalar Iconos (Svelte Iconoir)

```bash
npm install -D svelte-iconoir
```

### Uso

```svelte
<script>
	import { Calendar, Home, User } from 'svelte-iconoir';
</script>

<Calendar class="size-6" />
<Home />
<User />
```

**Explorar iconos:** https://iconoir.com/

---

## 🔧 Paso 6: Plugins Adicionales de Tailwind

### Forms Plugin

Para estilos mejorados en formularios:

```bash
npm install -D @tailwindcss/forms
```

Actualiza `layout.css`:

```css
@import 'tailwindcss';
@plugin '@tailwindcss/forms';
@plugin 'daisyui';
```

### Typography Plugin

Para contenido de texto enriquecido (artículos, blogs):

```bash
npm install -D @tailwindcss/typography
```

Actualiza `layout.css`:

```css
@import 'tailwindcss';
@plugin '@tailwindcss/forms';
@plugin '@tailwindcss/typography';
@plugin 'daisyui';
```

---

## 📦 Paso 7: Librerías Adicionales (Opcionales)

### PhotoSwipe (Lightbox para imágenes)

```bash
npm install photoswipe
```

### Swiper (Carruseles/Sliders)

```bash
npm install swiper
```

### clsx (Utilidad para clases condicionales)

```bash
npm install clsx
```

Uso:

```typescript
import cn from 'clsx';

const classes = cn(
  'base-class',
  isActive && 'active-class',
  isDisabled && 'disabled-class'
);
```

---

## 📁 Paso 8: Estructura de Carpetas Recomendada

```
src/
├── lib/
│   ├── components/       # Componentes reutilizables
│   │   ├── Calendar.svelte
│   │   ├── RangeCalendar.svelte
│   │   └── ComboBox.svelte
│   ├── actions/          # Svelte actions
│   │   └── confirmAction.ts
│   ├── config/           # Configuraciones globales
│   │   └── components.ts
│   ├── styles/           # Estilos CSS personalizados
│   │   ├── variables.css
│   │   └── custom.css
│   ├── types/            # Tipos TypeScript
│   │   └── index.ts
│   └── utils/            # Utilidades
│       └── helpers.ts
├── routes/
│   ├── (app)/            # Grupo de rutas con layout
│   │   ├── +layout.svelte
│   │   ├── +page.svelte
│   │   └── activities/
│   │       └── +page.svelte
│   ├── layout.css        # Estilos globales base
│   └── +layout.svelte    # Layout raíz
└── app.html              # HTML base
```

---

## 🎯 Paso 9: Configuración de TypeScript

El `tsconfig.json` ya viene configurado, pero asegúrate de tener:

```json
{
	"extends": "./.svelte-kit/tsconfig.json",
	"compilerOptions": {
		"allowJs": true,
		"checkJs": true,
		"esModuleInterop": true,
		"forceConsistentCasingInFileNames": true,
		"resolveJsonModule": true,
		"skipLibCheck": true,
		"sourceMap": true,
		"strict": true,
		"moduleResolution": "bundler"
	}
}
```

---

## 🔍 Paso 10: Configuración de ESLint y Prettier

### ESLint

El archivo `eslint.config.js` debe incluir:

```javascript
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
	js.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	}
];
```

### Prettier

Crea `.prettierrc`:

```json
{
	"useTabs": true,
	"singleQuote": true,
	"trailingComma": "none",
	"printWidth": 100,
	"plugins": ["prettier-plugin-svelte", "prettier-plugin-tailwindcss"],
	"overrides": [{ "files": "*.svelte", "options": { "parser": "svelte" } }]
}
```

Instala plugins:

```bash
npm install -D prettier-plugin-svelte prettier-plugin-tailwindcss
```

---

## 🚦 Paso 11: Scripts de package.json

Asegúrate de tener estos scripts:

```json
{
	"scripts": {
		"dev": "vite dev",
		"build": "vite build",
		"preview": "vite preview",
		"check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
		"check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
		"format": "prettier --write .",
		"lint": "prettier --check . && eslint ."
	}
}
```

---

## 🎨 Paso 12: Utilidades CSS Personalizadas

En `src/routes/layout.css`, puedes añadir utilidades personalizadas:

```css
@import 'tailwindcss';
@plugin '@tailwindcss/forms';
@plugin '@tailwindcss/typography';
@plugin 'daisyui';

/* Utilidad personalizada para checkboxes */
@utility checkbox {
	@apply rounded-sm;
}

/* Fix para toggle de DaisyUI con Bits-UI */
input[type='checkbox'].toggle {
	background-image: none !important;
}
```

---

## 🌍 Paso 13: Internacionalización (Opcional)

Para i18n, usa Paraglide (recomendado oficialmente por Svelte):

```bash
npx @inlang/paraglide-js init
npm install -D @inlang/paraglide-js-adapter-sveltekit
```

**Documentación:**

- https://svelte.dev/docs/cli/paraglide
- https://inlang.com/m/gerre34r/library-inlang-paraglideJs/sveltekit/

---

## ✅ Paso 14: Verificar la Instalación

```bash
# Iniciar servidor de desarrollo
npm run dev

# Verificar tipos
npm run check

# Formatear código
npm run format

# Verificar linting
npm run lint
```

Abre http://localhost:5173 y deberías ver tu aplicación funcionando.

---

## 📚 Recursos Adicionales

### Documentación Oficial

- **SvelteKit:** https://svelte.dev/docs/kit
- **Svelte 5:** https://svelte.dev/docs/svelte/overview
- **Tailwind CSS v4:** https://tailwindcss.com/docs
- **DaisyUI:** https://daisyui.com/
- **Bits-UI:** https://www.bits-ui.com/docs/introduction

### Componentes y Herramientas

- **Iconoir:** https://iconoir.com/
- **PhotoSwipe:** https://photoswipe.com/
- **Swiper:** https://swiperjs.com/

### Svelte 5 - Runes Mode

Este proyecto usa Svelte 5 con runes mode. Conceptos clave:

```svelte
<script lang="ts">
	// Estado reactivo
	let count = $state(0);

	// Props
	let { value = $bindable(), class: className = '' } = $props();

	// Valores derivados
	let doubled = $derived(count * 2);

	// Efectos
	$effect(() => {
		console.log('Count changed:', count);
	});
</script>
```

---

## 🎉 ¡Listo!

Tu proyecto SvelteKit está configurado con:

- ✅ TypeScript
- ✅ Tailwind CSS v4
- ✅ DaisyUI
- ✅ Bits-UI
- ✅ Iconos (Svelte Iconoir)
- ✅ ESLint + Prettier
- ✅ Estructura de carpetas organizada

Ahora puedes empezar a crear componentes y páginas. ¡Feliz desarrollo! 🚀
