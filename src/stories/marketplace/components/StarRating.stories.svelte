<script context="module">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import StarRating from '$lib/components/StarRating.svelte';

	const { Story } = defineMeta({
		title: 'Marketplace/Components/StarRating',
		component: StarRating,
		tags: ['autodocs']
	});
</script>

<Story name="All Ratings">
	<div class="space-y-8 p-8">
		<h1 class="text-h1 mb-4">Star Rating Component</h1>
		<p class="text-p-lg mb-8 max-w-3xl">
			Componente de valoración con estrellas que redondea automáticamente a medias estrellas.
			Independiente de DaisyUI, usa máscaras CSS para crear las formas.
		</p>

		<section>
			<h2 class="text-h2 mb-6">Ratings from 0 to 5 (increments of 0.5)</h2>
			<div class="space-y-4">
				<div class="flex items-center gap-4">
					<span class="text-p-base w-16">0.0</span>
					<StarRating value={0} />
				</div>
				<div class="flex items-center gap-4">
					<span class="text-p-base w-16">0.5</span>
					<StarRating value={0.5} />
				</div>
				<div class="flex items-center gap-4">
					<span class="text-p-base w-16">1.0</span>
					<StarRating value={1} />
				</div>
				<div class="flex items-center gap-4">
					<span class="text-p-base w-16">1.5</span>
					<StarRating value={1.5} />
				</div>
				<div class="flex items-center gap-4">
					<span class="text-p-base w-16">2.0</span>
					<StarRating value={2} />
				</div>
				<div class="flex items-center gap-4">
					<span class="text-p-base w-16">2.5</span>
					<StarRating value={2.5} />
				</div>
				<div class="flex items-center gap-4">
					<span class="text-p-base w-16">3.0</span>
					<StarRating value={3} />
				</div>
				<div class="flex items-center gap-4">
					<span class="text-p-base w-16">3.5</span>
					<StarRating value={3.5} />
				</div>
				<div class="flex items-center gap-4">
					<span class="text-p-base w-16">4.0</span>
					<StarRating value={4} />
				</div>
				<div class="flex items-center gap-4">
					<span class="text-p-base w-16">4.5</span>
					<StarRating value={4.5} />
				</div>
				<div class="flex items-center gap-4">
					<span class="text-p-base w-16">5.0</span>
					<StarRating value={5} />
				</div>
			</div>
		</section>
	</div>
</Story>

<Story name="Sizes">
	<div class="space-y-8 p-8">
		<h1 class="text-h1 mb-4">Star Rating Sizes</h1>
		<p class="text-p-lg mb-8 max-w-3xl">
			El componente soporta 5 tamaños diferentes: xs, sm, md, lg, xl. Los tamaños se definen
			mediante variables CSS para facilitar su personalización.
		</p>

		<section class="space-y-6">
			<div>
				<h3 class="text-h3 mb-3">Extra Small (xs) - 16px</h3>
				<StarRating value={4.5} size="xs" />
			</div>

			<div>
				<h3 class="text-h3 mb-3">Small (sm) - 20px</h3>
				<StarRating value={4.5} size="sm" />
			</div>

			<div>
				<h3 class="text-h3 mb-3">Medium (md) - 24px</h3>
				<StarRating value={4.5} size="md" />
			</div>

			<div>
				<h3 class="text-h3 mb-3">Large (lg) - 32px</h3>
				<StarRating value={4.5} size="lg" />
			</div>

			<div>
				<h3 class="text-h3 mb-3">Extra Large (xl) - 40px</h3>
				<StarRating value={4.5} size="xl" />
			</div>
		</section>

		<section class="mt-12">
			<h2 class="text-h2 mb-6">Size Comparison</h2>
			<div class="flex items-end gap-6">
				<div class="text-center">
					<StarRating value={4.5} size="xs" />
					<p class="text-p-xs mt-2">xs</p>
				</div>
				<div class="text-center">
					<StarRating value={4.5} size="sm" />
					<p class="text-p-xs mt-2">sm</p>
				</div>
				<div class="text-center">
					<StarRating value={4.5} size="md" />
					<p class="text-p-xs mt-2">md</p>
				</div>
				<div class="text-center">
					<StarRating value={4.5} size="lg" />
					<p class="text-p-xs mt-2">lg</p>
				</div>
				<div class="text-center">
					<StarRating value={4.5} size="xl" />
					<p class="text-p-xs mt-2">xl</p>
				</div>
			</div>
		</section>
	</div>
</Story>

<Story name="Custom Colors">
	<div class="space-y-8 p-8">
		<h1 class="text-h1 mb-4">Custom Colors</h1>
		<p class="text-p-lg mb-8 max-w-3xl">
			Puedes personalizar los colores de las estrellas llenas y vacías usando las props
			<code>filledClass</code> y <code>emptyClass</code>.
		</p>

		<section class="space-y-6">
			<div>
				<h3 class="text-h3 mb-3">Default (Yellow & Gray)</h3>
				<StarRating value={3.5} size="lg" />
			</div>

			<div>
				<h3 class="text-h3 mb-3">Custom with Tailwind classes</h3>
				<StarRating value={3.5} size="lg" filledClass="text-red-500" emptyClass="text-red-100" />
			</div>

			<div>
				<h3 class="text-h3 mb-3">Green stars</h3>
				<StarRating
					value={3.5}
					size="lg"
					filledClass="text-green-500"
					emptyClass="text-green-100"
				/>
			</div>

			<div>
				<h3 class="text-h3 mb-3">Blue stars</h3>
				<StarRating value={3.5} size="lg" filledClass="text-blue-500" emptyClass="text-blue-100" />
			</div>

			<div>
				<h3 class="text-h3 mb-3">Purple stars</h3>
				<StarRating
					value={3.5}
					size="lg"
					filledClass="text-purple-500"
					emptyClass="text-purple-100"
				/>
			</div>
		</section>
	</div>
</Story>

<Story name="Null Value">
	<div class="space-y-8 p-8">
		<h1 class="text-h1 mb-4">Null Value Handling</h1>
		<p class="text-p-lg mb-8 max-w-3xl">
			Cuando el valor es <code>null</code>, el componente muestra un guión (—) en lugar de
			estrellas.
		</p>

		<div class="flex items-center gap-4">
			<span class="text-p-base w-32">Null value:</span>
			<StarRating value={null} />
		</div>
	</div>
</Story>

<Story name="Usage & Specs">
	<div class="p-8">
		<h1 class="text-h1 mb-8">StarRating Component</h1>
		<p class="text-p-lg mb-12 max-w-3xl">
			Componente de valoración con estrellas independiente de DaisyUI. Usa máscaras CSS para crear
			las formas de estrella y soporta medias estrellas automáticamente.
		</p>

		<!-- Props -->
		<section class="mb-12">
			<h2 class="text-h2 mb-4">Props</h2>
			<div class="overflow-x-auto">
				<table class="w-full border-collapse">
					<thead>
						<tr class="border-b-2 border-neutral-200">
							<th class="text-p-base p-3 text-left font-bold">Prop</th>
							<th class="text-p-base p-3 text-left font-bold">Type</th>
							<th class="text-p-base p-3 text-left font-bold">Default</th>
							<th class="text-p-base p-3 text-left font-bold">Description</th>
						</tr>
					</thead>
					<tbody>
						<tr class="border-b border-neutral-100">
							<td class="text-p-base p-3 font-mono">value</td>
							<td class="text-p-base p-3 font-mono">number | null</td>
							<td class="text-p-base p-3">-</td>
							<td class="text-p-base p-3">Valor de la valoración (0-5). Se redondea a 0.5</td>
						</tr>
						<tr class="border-b border-neutral-100">
							<td class="text-p-base p-3 font-mono">size</td>
							<td class="text-p-base p-3 font-mono">'xs' | 'sm' | 'md' | 'lg' | 'xl'</td>
							<td class="text-p-base p-3 font-mono">'xs'</td>
							<td class="text-p-base p-3">Tamaño de las estrellas</td>
						</tr>
						<tr class="border-b border-neutral-100">
							<td class="text-p-base p-3 font-mono">filledClass</td>
							<td class="text-p-base p-3 font-mono">string</td>
							<td class="text-p-base p-3 font-mono">'c-star-filled'</td>
							<td class="text-p-base p-3">Clase CSS para estrellas llenas</td>
						</tr>
						<tr class="border-b border-neutral-100">
							<td class="text-p-base p-3 font-mono">emptyClass</td>
							<td class="text-p-base p-3 font-mono">string</td>
							<td class="text-p-base p-3 font-mono">'c-star-empty'</td>
							<td class="text-p-base p-3">Clase CSS para estrellas vacías</td>
						</tr>
					</tbody>
				</table>
			</div>
		</section>

		<!-- Code Examples -->
		<section class="mb-12">
			<h2 class="text-h2 mb-4">Code Examples</h2>
			<div class="space-y-6">
				<div>
					<h3 class="text-h3 mb-3">Basic Usage</h3>
					<pre class="rounded-lg bg-neutral-900 p-4 text-white"><code
							>{`<!-- Import the component -->
<script>
  import StarRating from '$lib/components/StarRating.svelte';
<\/script>

<!-- Use it -->
<StarRating value={4.5} />`}</code
						></pre>
				</div>

				<div>
					<h3 class="text-h3 mb-3">With Size</h3>
					<pre class="rounded-lg bg-neutral-900 p-4 text-white"><code
							>{`<StarRating value={3.7} size="lg" />`}</code
						></pre>
				</div>

				<div>
					<h3 class="text-h3 mb-3">With Custom Colors</h3>
					<pre class="rounded-lg bg-neutral-900 p-4 text-white"><code
							>{`<StarRating
  value={4.2}
  size="md"
  filledClass="text-red-500"
  emptyClass="text-red-100"
/>`}</code
						></pre>
				</div>

				<div>
					<h3 class="text-h3 mb-3">Null Value</h3>
					<pre class="rounded-lg bg-neutral-900 p-4 text-white"><code
							>{`<StarRating value={null} />`}</code
						></pre>
				</div>
			</div>
		</section>

		<!-- CSS Variables -->
		<section class="mb-12">
			<h2 class="text-h2 mb-4">CSS Variables</h2>
			<p class="text-p-base mb-4">
				Puedes personalizar los colores y tamaños globalmente modificando las variables CSS en
				<code>c-star-rating.css</code>:
			</p>
			<div class="rounded-lg border border-neutral-200 bg-white p-6">
				<h3 class="text-h3 mb-4">Colors</h3>
				<ul class="text-p-base mb-6 space-y-2 font-mono text-sm">
					<li>--star-rating-filled: #fbbf24 (yellow-400)</li>
					<li>--star-rating-empty: #d1d5db (neutral-300)</li>
				</ul>

				<h3 class="text-h3 mb-4">Sizes</h3>
				<ul class="text-p-base mb-6 space-y-2 font-mono text-sm">
					<li>--star-rating-size-xs: 1rem (16px)</li>
					<li>--star-rating-size-sm: 1.25rem (20px)</li>
					<li>--star-rating-size-md: 1.5rem (24px)</li>
					<li>--star-rating-size-lg: 2rem (32px)</li>
					<li>--star-rating-size-xl: 2.5rem (40px)</li>
				</ul>

				<h3 class="text-h3 mb-4">Spacing</h3>
				<ul class="text-p-base space-y-2 font-mono text-sm">
					<li>--star-rating-gap: 0.25rem (4px)</li>
				</ul>
			</div>
		</section>

		<!-- Technical Details -->
		<section class="mb-12">
			<h2 class="text-h2 mb-4">Technical Details</h2>
			<div class="rounded-lg bg-blue-50 p-6">
				<ul class="text-p-base space-y-3">
					<li>✅ Independiente de DaisyUI</li>
					<li>✅ Usa máscaras CSS (<code>mask-image</code>) con SVG data URIs</li>
					<li>✅ Soporta medias estrellas automáticamente</li>
					<li>✅ Redondea valores a incrementos de 0.5</li>
					<li>✅ 5 tamaños predefinidos (xs, sm, md, lg, xl)</li>
					<li>✅ Colores personalizables vía props o variables CSS</li>
					<li>✅ Accesible con atributos <code>aria-current</code></li>
					<li>✅ Compatible con todos los navegadores modernos</li>
				</ul>
			</div>
		</section>

		<!-- How It Works -->
		<section class="mb-12">
			<h2 class="text-h2 mb-4">How It Works</h2>
			<div class="space-y-4">
				<p class="text-p-base">
					Cada estrella se compone de <strong>2 divs</strong> (mitad izquierda + mitad derecha):
				</p>
				<ul class="text-p-base list-inside list-disc space-y-2">
					<li>
						<strong>Estrella llena:</strong> Ambas mitades usan <code>filledClass</code>
					</li>
					<li>
						<strong>Media estrella:</strong> Mitad izquierda usa <code>filledClass</code>, mitad
						derecha usa <code>emptyClass</code>
					</li>
					<li>
						<strong>Estrella vacía:</strong> Ambas mitades usan <code>emptyClass</code>
					</li>
				</ul>
				<p class="text-p-base">
					Las máscaras CSS recortan cada mitad usando <code>mask-size: 200%</code> y
					<code>mask-position: left/right</code>.
				</p>
			</div>
		</section>
	</div>
</Story>
