<script context="module">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Marketplace/Design System/Typography',
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	// Función para extraer información de las clases de tipografía
	function getTypographyClasses() {
		const typography: {
			name: string;
			category: string;
			fontFamily: string;
			fontWeight: string;
			fontSize: string;
			fontSizePx: string;
			lineHeight: string;
			lineHeightPx: string;
		}[] = [];

		// Clases de tipografía que buscamos
		const typographyClasses = [
			// Headings UI
			'text-h1',
			'text-h2',
			'text-h3',
			'text-h4',
			// Paragraphs UI
			'text-p-lg',
			'text-p-base',
			'text-p-sm',
			'text-p-xs',
			// Special
			'text-price',
			'text-metric',
			// Editorial Headings
			'text-editorial-h1',
			'text-editorial-h2',
			'text-editorial-h3',
			'text-editorial-h4',
			// Editorial Paragraphs
			'text-editorial-p-lg',
			'text-editorial-p-base',
			'text-editorial-p-sm'
		];

		// Crear un elemento temporal para obtener estilos computados
		const tempDiv = document.createElement('div');
		document.body.appendChild(tempDiv);

		typographyClasses.forEach((className) => {
			tempDiv.className = className;
			const styles = getComputedStyle(tempDiv);

			const fontFamily = styles.fontFamily;
			const fontWeight = styles.fontWeight;
			const fontSize = styles.fontSize;
			const lineHeight = styles.lineHeight;

			// Convertir px a rem (asumiendo 16px = 1rem)
			const fontSizePx = fontSize;
			const fontSizeRem = `${(parseFloat(fontSize) / 16).toFixed(3)}rem`;

			const lineHeightPx = lineHeight;
			const lineHeightRem = `${(parseFloat(lineHeight) / 16).toFixed(3)}rem`;

			// Determinar si es sans o serif
			const isSans = fontFamily.includes('Inter') || fontFamily.includes('sans-serif');
			const isSerif = fontFamily.includes('Literata') || fontFamily.includes('serif');
			const fontType = isSerif ? 'Serif (Literata)' : isSans ? 'Sans (Inter)' : fontFamily;

			// Categorizar
			let category = 'Other';
			if (className.includes('editorial-h')) category = 'Editorial Headings';
			else if (className.includes('editorial-p')) category = 'Editorial Paragraphs';
			else if (className.startsWith('text-h')) category = 'UI Headings';
			else if (className.startsWith('text-p')) category = 'UI Paragraphs';
			else if (className.includes('price') || className.includes('metric')) category = 'Special';

			typography.push({
				name: className,
				category,
				fontFamily: fontType,
				fontWeight,
				fontSize: fontSizeRem,
				fontSizePx,
				lineHeight: lineHeightRem,
				lineHeightPx
			});
		});

		document.body.removeChild(tempDiv);

		// Agrupar por categoría
		const grouped = typography.reduce(
			(acc, item) => {
				if (!acc[item.category]) {
					acc[item.category] = [];
				}
				acc[item.category].push(item);
				return acc;
			},
			{} as Record<string, typeof typography>
		);

		return grouped;
	}

	let typographyGroups = $state({});

	// Cargar tipografías cuando el componente se monta
	$effect(() => {
		typographyGroups = getTypographyClasses();
	});

	// Texto de ejemplo
	const sampleText = 'The quick brown fox jumps over the lazy dog';
	const sampleTextLong =
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
</script>

<Story name="All Typography">
	<div class="p-8">
		<h1 class="text-h1 mb-8">Marketplace Typography System</h1>
		<p class="text-p-lg mb-12 max-w-3xl">
			Sistema de tipografía del marketplace basado en las especificaciones de Figma. Todas las
			clases son responsive y se adaptan automáticamente a tablet (≤1024px) y mobile (≤640px).
		</p>

		{#each Object.entries(typographyGroups) as [category, items]}
			<section class="mb-16">
				<h2 class="text-h2 mb-8 border-b-2 border-neutral-200 pb-2">{category}</h2>

				<div class="space-y-8">
					{#each items as item}
						<div class="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
							<!-- Preview -->
							<div class="mb-6 border-b border-neutral-100 pb-6">
								<p class={item.name}>{sampleText}</p>
							</div>

							<!-- Specs -->
							<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
								<!-- Class Name -->
								<div>
									<dt class="text-p-xs mb-1 font-semibold uppercase text-neutral-500">Class</dt>
									<dd class="font-mono text-neutral-900">
										<code
											class="rounded bg-neutral-100 px-2 py-1 text-sm"
											onclick={() => navigator.clipboard.writeText(item.name)}
											style="cursor: pointer;"
											title="Click to copy"
										>
											{item.name}
										</code>
									</dd>
								</div>

								<!-- Font Family -->
								<div>
									<dt class="text-p-xs mb-1 font-semibold uppercase text-neutral-500">
										Font Family
									</dt>
									<dd class="text-neutral-900">{item.fontFamily}</dd>
								</div>

								<!-- Font Weight -->
								<div>
									<dt class="text-p-xs mb-1 font-semibold uppercase text-neutral-500">
										Font Weight
									</dt>
									<dd class="text-neutral-900">
										{item.fontWeight}
										{#if item.fontWeight === '400'}
											(Regular)
										{:else if item.fontWeight === '500'}
											(Medium)
										{:else if item.fontWeight === '600'}
											(Semibold)
										{:else if item.fontWeight === '700'}
											(Bold)
										{:else if item.fontWeight === '900'}
											(Black)
										{/if}
									</dd>
								</div>

								<!-- Font Size -->
								<div>
									<dt class="text-p-xs mb-1 font-semibold uppercase text-neutral-500">Font Size</dt>
									<dd class="text-neutral-900">
										{item.fontSize}
										<span class="text-neutral-500">({item.fontSizePx})</span>
									</dd>
								</div>

								<!-- Line Height -->
								<div>
									<dt class="text-p-xs mb-1 font-semibold uppercase text-neutral-500">
										Line Height
									</dt>
									<dd class="text-neutral-900">
										{item.lineHeight}
										<span class="text-neutral-500">({item.lineHeightPx})</span>
									</dd>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/each}
	</div>
</Story>

<Story name="Size Comparison">
	<div class="p-8">
		<h1 class="text-h1 mb-8">Typography Scale Comparison</h1>
		<p class="text-p-lg mb-12 max-w-3xl">
			Comparación visual de todos los tamaños de tipografía disponibles.
		</p>

		<!-- UI Headings -->
		<section class="mb-12">
			<h2 class="text-h2 mb-6">UI Headings</h2>
			<div class="space-y-4">
				<div class="text-h1">H1 - {sampleText}</div>
				<div class="text-h2">H2 - {sampleText}</div>
				<div class="text-h3">H3 - {sampleText}</div>
				<div class="text-h4">H4 - {sampleText}</div>
			</div>
		</section>

		<!-- UI Paragraphs -->
		<section class="mb-12">
			<h2 class="text-h2 mb-6">UI Paragraphs</h2>
			<div class="space-y-4">
				<p class="text-p-lg">{sampleTextLong}</p>
				<p class="text-p-base">{sampleTextLong}</p>
				<p class="text-p-sm">{sampleTextLong}</p>
				<p class="text-p-xs">{sampleTextLong}</p>
			</div>
		</section>

		<!-- Editorial Headings -->
		<section class="mb-12">
			<h2 class="text-h2 mb-6">Editorial Headings</h2>
			<div class="space-y-4">
				<div class="text-editorial-h1">Editorial H1 - {sampleText}</div>
				<div class="text-editorial-h2">Editorial H2 - {sampleText}</div>
				<div class="text-editorial-h3">Editorial H3 - {sampleText}</div>
				<div class="text-editorial-h4">Editorial H4 - {sampleText}</div>
			</div>
		</section>

		<!-- Editorial Paragraphs -->
		<section class="mb-12">
			<h2 class="text-h2 mb-6">Editorial Paragraphs</h2>
			<div class="space-y-4">
				<p class="text-editorial-p-lg">{sampleTextLong}</p>
				<p class="text-editorial-p-base">{sampleTextLong}</p>
				<p class="text-editorial-p-sm">{sampleTextLong}</p>
			</div>
		</section>

		<!-- Special -->
		<section class="mb-12">
			<h2 class="text-h2 mb-6">Special</h2>
			<div class="space-y-4">
				<div class="text-price">€149.00</div>
				<div class="text-metric">4.8★ (245 reviews)</div>
			</div>
		</section>
	</div>
</Story>

<Story name="Usage Examples">
	<div class="p-8">
		<h1 class="text-h1 mb-8">Typography Usage Examples</h1>

		<section class="mb-12">
			<h2 class="text-h2 mb-4">Basic Usage</h2>
			<p class="text-p-base mb-4">Aplica las clases directamente a tus elementos HTML:</p>
			<pre class="rounded-lg bg-neutral-900 p-4 text-white"><code
					>{`<!-- Headings -->
<h1 class="text-h1">Main Title</h1>
<h2 class="text-h2">Section Title</h2>

<!-- Paragraphs -->
<p class="text-p-lg">Large paragraph text</p>
<p class="text-p-base">Regular paragraph text</p>

<!-- Editorial -->
<h1 class="text-editorial-h1">Hero Title</h1>
<p class="text-editorial-p-lg">Featured content</p>

<!-- Special -->
<span class="text-price">€99.00</span>
<span class="text-metric">4.5★</span>`}</code
				></pre>
		</section>

		<section class="mb-12">
			<h2 class="text-h2 mb-4">Responsive Behavior</h2>
			<p class="text-p-base mb-4">
				Todas las clases son automáticamente responsive. No necesitas añadir breakpoints:
			</p>
			<div class="rounded-lg bg-blue-50 p-6">
				<ul class="text-p-base space-y-2">
					<li>✅ <strong>Desktop</strong> - Tamaño completo</li>
					<li>✅ <strong>Tablet (≤1024px)</strong> - Tamaño medio</li>
					<li>✅ <strong>Mobile (≤640px)</strong> - Tamaño reducido</li>
				</ul>
			</div>
		</section>

		<section class="mb-12">
			<h2 class="text-h2 mb-4">Live Example</h2>
			<div class="rounded-lg border border-neutral-200 bg-white p-8">
				<h1 class="text-h1 mb-4">Welcome to Our Marketplace</h1>
				<p class="text-p-lg mb-6">
					Discover unique experiences in incredible destinations around the world.
				</p>
				<div class="mb-4 flex items-center gap-4">
					<span class="text-price">€149.00</span>
					<span class="text-metric">4.8★</span>
				</div>
				<p class="text-p-base text-neutral-600">
					Join thousands of travelers who have already booked their next adventure with us.
				</p>
			</div>
		</section>
	</div>
</Story>
