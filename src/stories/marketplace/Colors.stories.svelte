<script context="module">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Marketplace/Design System/Colors',
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	// Función para extraer todas las variables CSS de color del documento
	function getColorVariables() {
		const colors: { name: string; value: string; category: string }[] = [];
		const styles = getComputedStyle(document.documentElement);

		// Obtener todas las propiedades CSS custom del :root
		const allProps = Array.from(document.styleSheets)
			.flatMap((sheet) => {
				try {
					return Array.from(sheet.cssRules);
				} catch (e) {
					return [];
				}
			})
			.filter((rule) => rule instanceof CSSStyleRule && rule.selectorText === ':root')
			.flatMap((rule) => {
				const style = (rule as CSSStyleRule).style;
				return Array.from(style).filter((prop) => prop.startsWith('--color-'));
			});

		// Eliminar duplicados y ordenar
		const uniqueProps = [...new Set(allProps)];

		uniqueProps.forEach((prop) => {
			const value = styles.getPropertyValue(prop).trim();
			if (value) {
				// Categorizar por prefijo
				let category = 'Other';
				if (prop.includes('--color-neutral-')) category = 'Neutral';
				else if (prop.includes('--color-action-')) category = 'Action';
				else if (prop.includes('--color-brand-')) category = 'Brand';
				else if (prop.includes('--color-violet-')) category = 'Violet';
				else if (prop.includes('--color-blue-')) category = 'Blue';
				else if (prop.includes('--color-green-')) category = 'Green';
				else if (prop.includes('--color-ochre-')) category = 'Ochre';
				else if (prop.includes('--color-yellow-')) category = 'Yellow';
				else if (prop.includes('--color-salmon-')) category = 'Salmon';
				else if (prop.includes('--color-info-')) category = 'Info';
				else if (prop.includes('--color-success-')) category = 'Success';
				else if (prop.includes('--color-warning-')) category = 'Warning';
				else if (prop.includes('--color-error-')) category = 'Error';
				else if (prop.includes('--color-status-')) category = 'Status';
				else if (prop.includes('--color-bg-')) category = 'Background';
				else if (prop.includes('--color-decorative-')) category = 'Decorative';
				else if (prop === '--color-white' || prop === '--color-black') category = 'Base';

				colors.push({
					name: prop,
					value,
					category
				});
			}
		});

		// Agrupar por categoría
		const grouped = colors.reduce(
			(acc, color) => {
				if (!acc[color.category]) {
					acc[color.category] = [];
				}
				acc[color.category].push(color);
				return acc;
			},
			{} as Record<string, typeof colors>
		);

		return grouped;
	}

	let colorGroups = $state({});

	// Cargar colores cuando el componente se monta
	$effect(() => {
		colorGroups = getColorVariables();
	});
</script>

<Story name="All Colors">
	<div class="p-8">
		<h1 class="text-h1 mb-8">Marketplace Color System</h1>
		<p class="text-p-lg mb-12 max-w-3xl">
			Sistema de colores del marketplace. Todos los colores se definen como variables CSS en
			<code class="rounded bg-neutral-100 px-2 py-1">colors.css</code> y están disponibles tanto
			para uso directo con <code class="rounded bg-neutral-100 px-2 py-1">var(--color-*)</code> como
			con clases de Tailwind
			<code class="rounded bg-neutral-100 px-2 py-1">bg-*</code>,
			<code class="rounded bg-neutral-100 px-2 py-1">text-*</code>, etc.
		</p>

		{#each Object.entries(colorGroups) as [category, colors]}
			<section class="mb-12">
				<h2 class="text-h2 mb-6 border-b-2 border-neutral-200 pb-2">{category}</h2>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each colors as color}
						<div class="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
							<!-- Color Swatch -->
							<div
								class="h-24 w-full"
								style="background-color: {color.value}"
								title={color.value}
							></div>

							<!-- Color Info -->
							<div class="p-4">
								<div class="mb-2">
									<code class="text-p-xs block font-mono font-semibold text-neutral-800">
										{color.name}
									</code>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-p-sm font-mono text-neutral-600">{color.value}</span>
									<button
										class="text-p-xs rounded bg-neutral-100 px-2 py-1 hover:bg-neutral-200"
										onclick={() => {
											navigator.clipboard.writeText(color.name);
										}}
										title="Copy variable name"
									>
										Copy
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/each}
	</div>
</Story>

<Story name="Usage Examples">
	<div class="p-8">
		<h1 class="text-h1 mb-8">Color Usage Examples</h1>

		<section class="mb-12">
			<h2 class="text-h2 mb-4">CSS Variables</h2>
			<p class="text-p-base mb-4">Usa las variables directamente en tu CSS:</p>
			<pre class="rounded-lg bg-neutral-900 p-4 text-white"><code
					>{`/* En tu CSS */
.my-component {
  background-color: var(--color-accent-500);
  color: var(--color-white);
}

/* En estilos inline */
<div style="background-color: var(--color-brand-accent-500)">
  Content
</div>`}</code
				></pre>
		</section>

		<section class="mb-12">
			<h2 class="text-h2 mb-4">Tailwind Classes</h2>
			<p class="text-p-base mb-4">
				Usa las clases de Tailwind generadas automáticamente desde las variables:
			</p>
			<pre class="rounded-lg bg-neutral-900 p-4 text-white"><code
					>{`<!-- Background -->
<div class="bg-action-primary-bg">Primary Background</div>

<!-- Text -->
<p class="text-neutral-700">Neutral Text</p>

<!-- Border -->
<div class="border-brand-accent-500">Accent Border</div>`}</code
				></pre>

			<div class="mt-6 space-y-4">
				<div class="bg-action-primary-bg text-action-primary-text rounded-lg p-4">
					bg-action-primary-bg + text-action-primary-text
				</div>
				<div class="bg-brand-accent-100 text-brand-accent-900 rounded-lg p-4">
					bg-brand-accent-100 + text-brand-accent-900
				</div>
				<div class="bg-success-100 text-success-700 rounded-lg p-4">
					bg-success-100 + text-success-700
				</div>
				<div class="bg-error-100 text-error-700 rounded-lg p-4">bg-error-100 + text-error-700</div>
			</div>
		</section>
	</div>
</Story>
