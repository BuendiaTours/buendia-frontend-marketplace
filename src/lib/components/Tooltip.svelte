<!--
Tooltip - Componente basado en la mecánica de DaisyUI pero sin sus clases visuales.

PROPÓSITO:
Envuelve cualquier elemento en un tooltip activado por hover/focus.
El contenido del tooltip se define con el prop `tip`.
El diseño visual (colores, border-radius, padding) se controla
100% mediante variables CSS en c-tooltip.css.

PROPS:
  tip        — Texto del tooltip (requerido)
  position   — 'top' | 'bottom' | 'left' | 'right' (default: 'top')
  open       — Forzar el tooltip visible (default: false)
  children   — Elemento trigger (slot por defecto)

USO:
```svelte
<Tooltip tip="Añadir a favoritos" position="top">
  <button>❤️</button>
</Tooltip>
```

PERSONALIZACIÓN:
Sobreescribe las variables CSS en tu componente o en el CSS global:
```css
.mi-contexto {
  --c-tooltip-bg: #1e293b;
  --c-tooltip-color: #f8fafc;
  --c-tooltip-radius: 4px;
}
```
-->

<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		tip: string;
		position?: 'top' | 'bottom' | 'left' | 'right';
		open?: boolean;
		children: Snippet;
	};

	let { tip, position = 'top', open = false, children }: Props = $props();

	const classes = $derived(
		['c-tooltip', `c-tooltip--${position}`, open ? 'c-tooltip--open' : ''].filter(Boolean).join(' ')
	);
</script>

<span class={classes} data-tip={tip}>
	{@render children()}
</span>
