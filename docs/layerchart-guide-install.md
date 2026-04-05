# Guía de instalación de LayerChart v2 en Svelte 5 + Tailwind 4

> Guía basada en la documentación oficial de [next.layerchart.com](https://next.layerchart.com), la versión para Svelte 5.

---

## 1. Instalar LayerChart

A diferencia de la v1, la v2 **no requiere instalar `layercake` ni `d3` por separado** — vienen incluidos como dependencias internas:

```bash
npm install layerchart
```

---

## 2. Configurar Tailwind CSS v4

### 2.1. Instalar el plugin de Vite

```bash
npm install -D tailwindcss @tailwindcss/vite
```

### 2.2. Configurar `vite.config.js`

```js
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(), // debe ir antes de sveltekit
		sveltekit()
	]
});
```

### 2.3. Configurar `src/app.css`

En Tailwind 4 no hay `tailwind.config.js` ni directivas `@tailwind`. Solo necesitas:

```css
@import 'tailwindcss';
```

> **Nota:** LayerChart v2 ya **no depende de Tailwind** para sus estilos internos. Tailwind es opcional y solo lo usarás para tus propias clases de layout (height, padding, etc.).

---

## 3. Aplicar el tema de LayerChart

LayerChart v2 usa variables CSS propias. Añade esto a tu `src/app.css` para personalizar colores:

```css
@import 'tailwindcss';

.lc-root-container {
	/* Color principal de los gráficos */
	--color-primary: var(--color-blue-500);

	/* Superficies (fondos progresivamente más oscuros) */
	--color-surface-100: var(--color-white);
	--color-surface-200: var(--color-gray-100);
	--color-surface-300: var(--color-gray-300);

	/* Color del texto */
	--color-surface-content: var(--color-gray-900);
}
```

Si usas un sistema de diseño, LayerChart incluye temas listos para usar:

```css
/* Elige solo uno según tu stack */
@import 'layerchart/shadcn-svelte.css'; /* shadcn-svelte */
@import 'layerchart/skeleton-3.css'; /* Skeleton v3 */
@import 'layerchart/skeleton-4.css'; /* Skeleton v4 */
@import 'layerchart/daisyui-5.css'; /* daisyUI v5 */
/* Svelte UX funciona sin importación adicional */
```

---

## 4. Primer gráfico: LineChart

En la v2 existen **componentes de alto nivel** (`LineChart`, `BarChart`, `AreaChart`...) que simplifican enormemente el uso. Este es el patrón recomendado:

```svelte
<script lang="ts">
	import { LineChart, defaultChartPadding } from 'layerchart';

	const data = [
		{ date: new Date('2024-01-01'), value: 10 },
		{ date: new Date('2024-02-01'), value: 45 },
		{ date: new Date('2024-03-01'), value: 28 },
		{ date: new Date('2024-04-01'), value: 60 },
		{ date: new Date('2024-05-01'), value: 35 },
		{ date: new Date('2024-06-01'), value: 80 }
	];
</script>

<div class="h-64">
	<LineChart {data} x="date" y="value" padding={defaultChartPadding({ right: 10 })} height={300} />
</div>
```

---

## 5. Gráfico de barras: BarChart

```svelte
<script lang="ts">
	import { BarChart } from 'layerchart';

	const data = [
		{ categoria: 'Ene', valor: 420 },
		{ categoria: 'Feb', valor: 380 },
		{ categoria: 'Mar', valor: 560 },
		{ categoria: 'Abr', valor: 490 }
	];
</script>

<div class="h-64">
	<BarChart {data} x="categoria" y="valor" height={300} />
</div>
```

Para barras horizontales añade `orientation="horizontal"`:

```svelte
<BarChart {data} x="categoria" y="valor" orientation="horizontal" height={300} />
```

---

## 6. Tooltip

En la v2, `Tooltip` es un componente de espacio de nombres (`Tooltip.Root`) y se pasa como **snippet** al componente de gráfico. Ya no se usa como componente hijo directo dentro del JSX del gráfico.

### Tooltip por defecto (incluido automáticamente)

`LineChart` y `BarChart` incluyen tooltip por defecto sin que tengas que hacer nada.

### Tooltip personalizado

```svelte
<script lang="ts">
	import { LineChart, Tooltip, defaultChartPadding } from 'layerchart';

	const data = [
		{ date: new Date('2024-01-01'), value: 10 },
		{ date: new Date('2024-02-01'), value: 45 },
		{ date: new Date('2024-03-01'), value: 28 }
	];
</script>

<div class="h-64">
	<LineChart {data} x="date" y="value" padding={defaultChartPadding({ right: 10 })} height={300}>
		{#snippet tooltip({ context })}
			<Tooltip.Root
				x="data"
				y={context.height}
				anchor="top"
				variant="none"
				class="rounded border border-gray-200 bg-white px-2 py-1 text-xs font-semibold shadow"
			>
				{#snippet children({ data })}
					{data.date.toLocaleDateString()} — {data.value}
				{/snippet}
			</Tooltip.Root>
		{/snippet}
	</LineChart>
</div>
```

---

## 7. Multi-series

```svelte
<script lang="ts">
	import { LineChart, defaultChartPadding } from 'layerchart';

	const data = [
		{ date: new Date('2024-01-01'), ventas: 10, gastos: 6 },
		{ date: new Date('2024-02-01'), ventas: 45, gastos: 20 },
		{ date: new Date('2024-03-01'), ventas: 28, gastos: 15 }
	];
</script>

<div class="h-64">
	<LineChart
		{data}
		x="date"
		y="ventas"
		series={[
			{ key: 'ventas', value: 'ventas', color: 'var(--color-blue-500)' },
			{ key: 'gastos', value: 'gastos', color: 'var(--color-red-500)' }
		]}
		padding={defaultChartPadding({ right: 10 })}
		height={300}
	/>
</div>
```

---

## 8. SSR en SvelteKit

Si usas la variante `Canvas` de algún componente, protégela con `browser`:

```svelte
<script lang="ts">
	import { browser } from '$app/environment';
	import { LineChart } from 'layerchart';
</script>

{#if browser}
	<LineChart {data} x="date" y="value" height={300} />
{/if}
```

Los componentes `Svg` (que son los que usan `LineChart` y `BarChart` por defecto) funcionan correctamente con SSR sin ninguna protección adicional.

---

## 9. Diferencias clave respecto a la v1

| Concepto              | v1                                      | v2                                |
| --------------------- | --------------------------------------- | --------------------------------- |
| Instalación           | `layerchart + layercake + d3`           | Solo `layerchart`                 |
| Tailwind en `content` | Obligatorio                             | No necesario                      |
| Componente raíz       | `<Chart><Svg>...</Svg></Chart>`         | `<LineChart />`, `<BarChart />`   |
| Capas internas        | `<Svg>`, `<Line>`, `<Area>`             | `<Layer>`, `<Spline>`, `<Bars>`   |
| Tooltip               | `<Tooltip><TooltipItem /></Tooltip>`    | `<Tooltip.Root>` via snippet      |
| Tema                  | Variables propias en cualquier selector | Variables en `.lc-root-container` |

---

## 10. Recursos

- **Documentación y ejemplos (v2/Svelte 5):** [next.layerchart.com](https://next.layerchart.com)
- **Getting Started:** [next.layerchart.com/docs/getting-started](https://next.layerchart.com/docs/getting-started)
- **Ejemplos LineChart:** [next.layerchart.com/docs/components/LineChart](https://next.layerchart.com/docs/components/LineChart)
- **Ejemplos BarChart:** [next.layerchart.com/docs/components/BarChart](https://next.layerchart.com/docs/components/BarChart)
- **Referencia Tooltip:** [next.layerchart.com/docs/components/Tooltip](https://next.layerchart.com/docs/components/Tooltip)
