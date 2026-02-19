# Custom Icons

Sistema de iconos custom compatible con `@solar-icons/svelte`.

## Uso

```svelte
<script>
	import { ExampleIcon } from '$lib/icons';
</script>

<!-- Básico -->
<ExampleIcon />

<!-- Con Tailwind -->
<ExampleIcon class="size-6 text-blue-500" />

<!-- Con props -->
<ExampleIcon size={32} strokeWidth={3} color="red" mirrored={true} alt="Descripción" />
```

**Props disponibles:** `class`, `size`, `strokeWidth`, `color`, `mirrored`, `alt`, `style`

- `strokeWidth`: Grosor del trazo (por defecto: `2`)

## Añadir iconos

### Automático (recomendado)

```bash
# 1. Colocar SVG en src/lib/icons/src/ organizados en carpetas (Linear/, Outline/, etc.)
# 2. Ejecutar
npm run generate:icons
```

El script genera componentes Svelte y actualiza exports automáticamente.

- Nombres: `custom-logo.svg` → `CustomLogo`
- Respeta estructura de carpetas: `src/Linear/icon.svg` → `custom/Linear/Icon.svelte`
- Convierte colores a `currentColor` y stroke-width a variable CSS

### Manual

1. Crear `src/lib/icons/custom/Linear/IconName.svelte`:

```svelte
<script lang="ts">
	import Icon from '../../IconBase.svelte';
	let props = $props();
</script>

<Icon {...props}>
	<path d="..." stroke="currentColor" />
</Icon>
```

2. Exportar en `src/lib/icons/custom/Linear.ts`:

```ts
export { default as IconName } from './Linear/IconName.svelte';
```

## Preparar SVG

- ViewBox: `0 0 24 24`
- Sin `width`/`height`
- Optimizar con [SVGOMG](https://jakearchibald.github.io/svgomg/)
- **Nota:** El script automáticamente convierte `fill`/`stroke` a `currentColor` y `stroke-width` a variable CSS

## Ejemplos

### En botones

```svelte
<button class="btn">
	<ExampleIcon class="size-5" />
	<span>Click me</span>
</button>
```

### Estado reactivo

```svelte
<script>
	import { ExampleIcon } from '$lib/icons';
	let isActive = $state(false);
</script>

<button onclick={() => (isActive = !isActive)}>
	<ExampleIcon class="size-6 {isActive ? 'text-blue-500' : 'text-gray-400'}" />
</button>
```

### Con Solar Icons

```svelte
<script>
	import { CloseSquare } from '@solar-icons/svelte/Linear';
	import { CustomLogo } from '$lib/icons';
</script>

<CloseSquare class="size-6" />
<CustomLogo class="size-6" />
```

## Avanzado

### Múltiples estilos (Bold, Linear, etc.)

```bash
# 1. Crear directorios
mkdir -p src/lib/icons/custom/{Bold,Linear}
mkdir -p static/icons/custom/{bold,linear}

# 2. Actualizar exports en src/lib/icons/custom/index.ts
export * as Outline from './Linear';
export * as Bold from './Bold';

# 3. Modificar script para soportar múltiples estilos
```

### IconBase personalizable

```svelte
<!-- src/lib/icons/IconBase.svelte -->
<script lang="ts">
	type Props = { viewBox?: string /* otras props */ };
	let { viewBox = '0 0 24 24', ...restProps }: Props = $props();
</script>

<svg {viewBox} {...restProps}>
	{@render children?.()}
</svg>
```

Uso: `<ExampleIcon viewBox="0 0 32 32" />`

### Iconos con múltiples colores

```svelte
<script lang="ts">
	import Icon from '../../IconBase.svelte';
	type Props = { primaryColor?: string; secondaryColor?: string; [key: string]: unknown };
	let { primaryColor = 'currentColor', secondaryColor = '#ccc', ...props }: Props = $props();
</script>

<Icon {...props}>
	<path fill={primaryColor} d="..." />
	<path fill={secondaryColor} d="..." />
</Icon>
```

### Animaciones

```svelte
<script>
	import { LoadingIcon } from '$lib/icons';
</script>

<LoadingIcon class="size-6 animate-spin" />

<style>
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	.animate-spin {
		animation: spin 1s linear infinite;
	}
</style>
```

### Optimización SVG con SVGO

```bash
npm install -D svgo
```

```ts
// En scripts/generate-custom-icons.ts
import { optimize } from 'svgo';

function optimizeSvg(svgContent: string): string {
	const result = optimize(svgContent, {
		plugins: ['removeDoctype', 'removeComments', 'removeMetadata']
	});
	return result.data;
}
```

## Troubleshooting

| Problema            | Solución                                                    |
| ------------------- | ----------------------------------------------------------- |
| Icono no se muestra | Verificar SVG válido, `currentColor`, viewBox correcto      |
| Color no cambia     | Usar `currentColor` en SVG, aplicar via clase/prop          |
| Script da error     | Validar SVG, estructura `<svg>...</svg>`, nombre de archivo |

## Estructura

```
src/lib/icons/
├── IconBase.svelte          # Wrapper reutilizable
├── src/                     # SVG fuente (organizados por carpetas)
│   ├── Linear/
│   ├── Outline/
│   └── Bold/
├── custom/                  # Componentes Svelte generados
│   ├── Linear/
│   │   └── IconName.svelte
│   ├── Linear.ts            # Exports
│   ├── Outline/
│   ├── Outline.ts
│   └── index.ts
└── index.ts
```
