<script lang="ts">
	const typographyStyles = [
		{
			category: 'Headings - UI',
			styles: [
				{
					class: 'text-h1',
					name: 'H1 - Serif Semibold',
					example: 'Descubre experiencias únicas en destinos increíbles'
				},
				{
					class: 'text-h2',
					name: 'H2 - Sans Bold',
					example: 'Actividades destacadas para tu próxima aventura'
				},
				{
					class: 'text-h3',
					name: 'H3 - Sans Bold',
					example: 'Explora las mejores opciones de turismo activo'
				},
				{
					class: 'text-h4',
					name: 'H4 - Sans Bold',
					example: 'Encuentra tu próxima experiencia inolvidable'
				}
			]
		},
		{
			category: 'Paragraphs - UI',
			styles: [
				{
					class: 'text-p-lg',
					name: 'Paragraph Large',
					example:
						'Este es un párrafo grande ideal para introducciones y textos destacados. Perfecto para captar la atención del usuario con información importante.'
				},
				{
					class: 'text-p-base',
					name: 'Paragraph Base (Default)',
					example:
						'Este es el párrafo base por defecto del marketplace. Se utiliza para el contenido general y la mayoría de textos descriptivos. Ofrece una lectura cómoda y equilibrada.'
				},
				{
					class: 'text-p-sm',
					name: 'Paragraph Small',
					example:
						'Este es un párrafo pequeño útil para información secundaria, notas al pie o detalles complementarios que no requieren tanto énfasis visual.'
				},
				{
					class: 'text-p-xs',
					name: 'Paragraph Extra Small',
					example:
						'Este es un párrafo extra pequeño para metadatos, etiquetas, disclaimers o información muy secundaria que debe ocupar poco espacio.'
				}
			]
		},
		{
			category: 'Special - Price & Metrics',
			styles: [
				{
					class: 'text-price',
					name: 'Price - Sans Black',
					example: '€149.00'
				},
				{
					class: 'text-metric',
					name: 'Metric - Sans Black',
					example: '4.8★ (245 reseñas)'
				}
			]
		},
		{
			category: 'Editorial - Headings',
			styles: [
				{
					class: 'text-editorial-h1',
					name: 'Editorial H1 - Serif Bold',
					example: 'La magia de viajar: historias que inspiran'
				},
				{
					class: 'text-editorial-h2',
					name: 'Editorial H2 - Serif Bold',
					example: 'Descubre los secretos mejor guardados de cada destino'
				},
				{
					class: 'text-editorial-h3',
					name: 'Editorial H3 - Serif Bold',
					example: 'Experiencias auténticas que transforman tu viaje'
				},
				{
					class: 'text-editorial-h4',
					name: 'Editorial H4 - Serif Bold',
					example: 'Consejos de expertos para viajeros curiosos'
				}
			]
		},
		{
			category: 'Editorial - Paragraphs',
			styles: [
				{
					class: 'text-editorial-p-lg',
					name: 'Editorial Paragraph Large',
					example:
						'Cada viaje es una historia por contar, una aventura que comienza con un solo paso. En este espacio editorial exploramos las experiencias más auténticas y memorables que puedes vivir.'
				},
				{
					class: 'text-editorial-p-base',
					name: 'Editorial Paragraph Base',
					example:
						'Los mejores destinos no se encuentran en los mapas, sino en los momentos compartidos y las conexiones genuinas con lugares y personas. Descubre cómo cada experiencia puede transformar tu forma de ver el mundo.'
				},
				{
					class: 'text-editorial-p-sm',
					name: 'Editorial Paragraph Small',
					example:
						'Viajar es más que visitar lugares; es sumergirse en culturas, sabores y tradiciones que enriquecen nuestra perspectiva y nos conectan con lo esencial.'
				}
			]
		}
	];
</script>

<div class="container mx-auto px-4 py-12">
	<!-- Header -->
	<div class="mb-12">
		<h1 class="text-h1 mb-4">Sistema de Tipografía</h1>
		<p class="text-p-lg max-w-3xl">
			Guía completa de estilos tipográficos del marketplace. Todos los estilos son responsive y se
			adaptan automáticamente a tablet (≤1024px) y mobile (≤640px).
		</p>
	</div>

	<!-- Typography Sections -->
	{#each typographyStyles as section}
		<section class="mb-16">
			<h2 class="text-h2 mb-8 pb-4 border-b-2 border-gray-200">{section.category}</h2>

			<div class="space-y-12">
				{#each section.styles as style}
					<div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
						<!-- Style Info -->
						<div class="mb-4 pb-4 border-b border-gray-100">
							<div class="flex items-center justify-between mb-2">
								<h3 class="text-h4">{style.name}</h3>
								<code
									class="text-p-xs bg-gray-100 px-3 py-1 rounded font-mono text-blue-600"
									>{style.class}</code
								>
							</div>
						</div>

						<!-- Example -->
						<div class="mt-4">
							<p class={style.class}>
								{style.example}
							</p>
						</div>

						<!-- Usage -->
						<div class="mt-4 pt-4 border-t border-gray-100">
							<details class="text-p-sm text-gray-600">
								<summary class="cursor-pointer hover:text-gray-900 font-medium">
									Ver código de ejemplo
								</summary>
								<pre
									class="mt-3 bg-gray-50 p-4 rounded text-p-xs overflow-x-auto"><code>&lt;p class="{style.class}"&gt;{style.example}&lt;/p&gt;</code></pre>
							</details>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/each}

	<!-- Footer Info -->
	<section class="mt-16 p-8 bg-blue-50 rounded-lg border border-blue-200">
		<h2 class="text-h3 mb-4">Información Importante</h2>
		<div class="space-y-4 text-p-base">
			<p>
				<strong>Responsive automático:</strong> Todos los estilos se adaptan automáticamente según el
				breakpoint sin necesidad de clases adicionales.
			</p>
			<p>
				<strong>Estilo por defecto:</strong> El body usa <code
					class="bg-white px-2 py-1 rounded">text-p-base</code
				> como estilo base.
			</p>
			<p>
				<strong>Clases Tailwind deshabilitadas:</strong> Las clases
				<code class="bg-white px-2 py-1 rounded">text-sm</code>,
				<code class="bg-white px-2 py-1 rounded">text-lg</code>, etc. están deshabilitadas. Usa las
				clases custom.
			</p>
			<p>
				<strong>Fuentes:</strong>
				<code class="bg-white px-2 py-1 rounded">var(--font-sans)</code> para Sans (Inter) y
				<code class="bg-white px-2 py-1 rounded">var(--font-serif)</code> para Serif (Literata).
			</p>
		</div>
	</section>

	<!-- Back Link -->
	<div class="mt-12 text-center">
		<a href="/" class="text-p-base text-blue-600 hover:text-blue-800 underline">
			← Volver al inicio
		</a>
	</div>
</div>
