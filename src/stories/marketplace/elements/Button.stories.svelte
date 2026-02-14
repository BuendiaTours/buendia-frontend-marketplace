<script context="module">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Marketplace/Elements/Button',
		tags: ['autodocs']
	});
</script>

<Story name="Primary">
	<div class="space-y-4">
		<div>
			<button class="e-button">Primary Button</button>
		</div>
		<div>
			<button class="e-button" disabled>Primary Disabled</button>
		</div>
	</div>
</Story>

<Story name="Secondary">
	<div class="space-y-4">
		<div>
			<button class="e-button e-button-secondary">Secondary Button</button>
		</div>
		<div>
			<button class="e-button e-button-secondary" disabled>Secondary Disabled</button>
		</div>
	</div>
</Story>

<Story name="Tertiary">
	<div class="space-y-4">
		<div>
			<button class="e-button e-button-tertiary">Tertiary Button</button>
		</div>
		<div>
			<button class="e-button e-button-tertiary" disabled>Tertiary Disabled</button>
		</div>
	</div>
</Story>

<Story name="Sizes">
	<div class="space-y-6">
		<div>
			<h3 class="text-h4 mb-3">Small</h3>
			<div class="flex gap-4">
				<button class="e-button e-button-sm">Primary Small</button>
				<button class="e-button e-button-secondary e-button-sm">Secondary Small</button>
				<button class="e-button e-button-tertiary e-button-sm">Tertiary Small</button>
			</div>
		</div>

		<div>
			<h3 class="text-h4 mb-3">Base (Default)</h3>
			<div class="flex gap-4">
				<button class="e-button">Primary Base</button>
				<button class="e-button e-button-secondary">Secondary Base</button>
				<button class="e-button e-button-tertiary">Tertiary Base</button>
			</div>
		</div>

		<div>
			<h3 class="text-h4 mb-3">Large</h3>
			<div class="flex gap-4">
				<button class="e-button e-button-lg">Primary Large</button>
				<button class="e-button e-button-secondary e-button-lg">Secondary Large</button>
				<button class="e-button e-button-tertiary e-button-lg">Tertiary Large</button>
			</div>
		</div>
	</div>
</Story>

<Story name="All Variants">
	<div class="space-y-8">
		<section>
			<h2 class="text-h2 mb-6">Primary Buttons</h2>
			<div class="space-y-4">
				<div class="flex items-center gap-4">
					<button class="e-button e-button-sm">Small</button>
					<button class="e-button">Base</button>
					<button class="e-button e-button-lg">Large</button>
				</div>
				<div class="flex items-center gap-4">
					<button class="e-button e-button-sm" disabled>Small Disabled</button>
					<button class="e-button" disabled>Base Disabled</button>
					<button class="e-button e-button-lg" disabled>Large Disabled</button>
				</div>
			</div>
		</section>

		<section>
			<h2 class="text-h2 mb-6">Secondary Buttons</h2>
			<div class="space-y-4">
				<div class="flex items-center gap-4">
					<button class="e-button e-button-secondary e-button-sm">Small</button>
					<button class="e-button e-button-secondary">Base</button>
					<button class="e-button e-button-secondary e-button-lg">Large</button>
				</div>
				<div class="flex items-center gap-4">
					<button class="e-button e-button-secondary e-button-sm" disabled>Small Disabled</button>
					<button class="e-button e-button-secondary" disabled>Base Disabled</button>
					<button class="e-button e-button-secondary e-button-lg" disabled>Large Disabled</button>
				</div>
			</div>
		</section>

		<section>
			<h2 class="text-h2 mb-6">Tertiary Buttons</h2>
			<div class="space-y-4">
				<div class="flex items-center gap-4">
					<button class="e-button e-button-tertiary e-button-sm">Small</button>
					<button class="e-button e-button-tertiary">Base</button>
					<button class="e-button e-button-tertiary e-button-lg">Large</button>
				</div>
				<div class="flex items-center gap-4">
					<button class="e-button e-button-tertiary e-button-sm" disabled>Small Disabled</button>
					<button class="e-button e-button-tertiary" disabled>Base Disabled</button>
					<button class="e-button e-button-tertiary e-button-lg" disabled>Large Disabled</button>
				</div>
			</div>
		</section>
	</div>
</Story>

<Story name="Usage & Specs">
	<div class="p-8">
		<h1 class="text-h1 mb-8">Button Element</h1>
		<p class="text-p-lg mb-12 max-w-3xl">
			Componente de botón básico del marketplace. Soporta tres variantes (primary, secondary,
			tertiary) y tres tamaños (small, base, large).
		</p>

		<!-- Base Class -->
		<section class="mb-12">
			<h2 class="text-h2 mb-4">Base Class</h2>
			<div class="rounded-lg border border-neutral-200 bg-white p-6">
				<code class="rounded bg-neutral-100 px-3 py-2 font-mono text-sm">.e-button</code>
				<p class="text-p-base mt-4">
					Clase base que define el estilo principal del botón (primary variant).
				</p>
			</div>
		</section>

		<!-- Variants -->
		<section class="mb-12">
			<h2 class="text-h2 mb-4">Variants</h2>
			<div class="space-y-4">
				<div class="rounded-lg border border-neutral-200 bg-white p-6">
					<div class="mb-4 flex items-center gap-4">
						<code class="rounded bg-neutral-100 px-3 py-2 font-mono text-sm">.e-button</code>
						<button class="e-button">Primary</button>
					</div>
					<p class="text-p-base text-neutral-600">
						Botón principal para acciones primarias. Usa colores de acción primary.
					</p>
				</div>

				<div class="rounded-lg border border-neutral-200 bg-white p-6">
					<div class="mb-4 flex items-center gap-4">
						<code class="rounded bg-neutral-100 px-3 py-2 font-mono text-sm"
							>.e-button-secondary</code
						>
						<button class="e-button e-button-secondary">Secondary</button>
					</div>
					<p class="text-p-base text-neutral-600">
						Botón secundario para acciones menos importantes. Fondo blanco con borde.
					</p>
				</div>

				<div class="rounded-lg border border-neutral-200 bg-white p-6">
					<div class="mb-4 flex items-center gap-4">
						<code class="rounded bg-neutral-100 px-3 py-2 font-mono text-sm"
							>.e-button-tertiary</code
						>
						<button class="e-button e-button-tertiary">Tertiary</button>
					</div>
					<p class="text-p-base text-neutral-600">
						Botón terciario para acciones alternativas. Fondo blanco con borde neutral.
					</p>
				</div>
			</div>
		</section>

		<!-- Sizes -->
		<section class="mb-12">
			<h2 class="text-h2 mb-4">Sizes</h2>
			<div class="space-y-4">
				<div class="rounded-lg border border-neutral-200 bg-white p-6">
					<div class="mb-4 flex items-center gap-4">
						<code class="rounded bg-neutral-100 px-3 py-2 font-mono text-sm">.e-button-sm</code>
						<button class="e-button e-button-sm">Small Button</button>
					</div>
					<p class="text-p-base text-neutral-600">
						Tamaño pequeño. Usa <code>text-p-sm</code> para tipografía.
					</p>
				</div>

				<div class="rounded-lg border border-neutral-200 bg-white p-6">
					<div class="mb-4 flex items-center gap-4">
						<code class="rounded bg-neutral-100 px-3 py-2 font-mono text-sm">.e-button</code>
						<button class="e-button">Base Button</button>
					</div>
					<p class="text-p-base text-neutral-600">
						Tamaño base (por defecto). Usa <code>text-p-base</code> para tipografía.
					</p>
				</div>

				<div class="rounded-lg border border-neutral-200 bg-white p-6">
					<div class="mb-4 flex items-center gap-4">
						<code class="rounded bg-neutral-100 px-3 py-2 font-mono text-sm">.e-button-lg</code>
						<button class="e-button e-button-lg">Large Button</button>
					</div>
					<p class="text-p-base text-neutral-600">
						Tamaño grande. Usa <code>text-p-lg</code> para tipografía.
					</p>
				</div>
			</div>
		</section>

		<!-- States -->
		<section class="mb-12">
			<h2 class="text-h2 mb-4">States</h2>
			<div class="space-y-4">
				<div class="rounded-lg border border-neutral-200 bg-white p-6">
					<div class="mb-4 flex items-center gap-4">
						<span class="text-p-base font-semibold">Default</span>
						<button class="e-button">Button</button>
					</div>
					<p class="text-p-base text-neutral-600">Estado por defecto del botón.</p>
				</div>

				<div class="rounded-lg border border-neutral-200 bg-white p-6">
					<div class="mb-4 flex items-center gap-4">
						<span class="text-p-base font-semibold">Hover</span>
						<button class="e-button">Hover me</button>
					</div>
					<p class="text-p-base text-neutral-600">
						Estado hover con transición suave de color de fondo.
					</p>
				</div>

				<div class="rounded-lg border border-neutral-200 bg-white p-6">
					<div class="mb-4 flex items-center gap-4">
						<span class="text-p-base font-semibold">Active</span>
						<button class="e-button">Click me</button>
					</div>
					<p class="text-p-base text-neutral-600">Estado activo al hacer click.</p>
				</div>

				<div class="rounded-lg border border-neutral-200 bg-white p-6">
					<div class="mb-4 flex items-center gap-4">
						<span class="text-p-base font-semibold">Disabled</span>
						<button class="e-button" disabled>Disabled</button>
					</div>
					<p class="text-p-base text-neutral-600">
						Estado deshabilitado con cursor not-allowed y colores reducidos.
					</p>
				</div>
			</div>
		</section>

		<!-- Code Examples -->
		<section class="mb-12">
			<h2 class="text-h2 mb-4">Code Examples</h2>
			<div class="space-y-6">
				<div>
					<h3 class="text-h3 mb-3">Basic Usage</h3>
					<pre class="rounded-lg bg-neutral-900 p-4 text-white"><code
							>{`<!-- Primary button -->
<button class="e-button">Click me</button>

<!-- Secondary button -->
<button class="e-button e-button-secondary">Click me</button>

<!-- Tertiary button -->
<button class="e-button e-button-tertiary">Click me</button>`}</code
						></pre>
				</div>

				<div>
					<h3 class="text-h3 mb-3">Sizes</h3>
					<pre class="rounded-lg bg-neutral-900 p-4 text-white"><code
							>{`<!-- Small -->
<button class="e-button e-button-sm">Small</button>

<!-- Base (default) -->
<button class="e-button">Base</button>

<!-- Large -->
<button class="e-button e-button-lg">Large</button>`}</code
						></pre>
				</div>

				<div>
					<h3 class="text-h3 mb-3">Disabled State</h3>
					<pre class="rounded-lg bg-neutral-900 p-4 text-white"><code
							>{`<!-- Using disabled attribute -->
<button class="e-button" disabled>Disabled</button>

<!-- Using disabled class -->
<button class="e-button disabled">Disabled</button>`}</code
						></pre>
				</div>

				<div>
					<h3 class="text-h3 mb-3">Combining Variants and Sizes</h3>
					<pre class="rounded-lg bg-neutral-900 p-4 text-white"><code
							>{`<!-- Large secondary button -->
<button class="e-button e-button-secondary e-button-lg">Large Secondary</button>

<!-- Small tertiary button -->
<button class="e-button e-button-tertiary e-button-sm">Small Tertiary</button>`}</code
						></pre>
				</div>
			</div>
		</section>

		<!-- CSS Variables Used -->
		<section class="mb-12">
			<h2 class="text-h2 mb-4">CSS Variables Used</h2>
			<div class="rounded-lg border border-neutral-200 bg-white p-6">
				<h3 class="text-h3 mb-4">Primary Variant</h3>
				<ul class="text-p-base space-y-2 font-mono text-sm">
					<li>--color-action-primary-bg</li>
					<li>--color-action-primary-bg-hover</li>
					<li>--color-action-primary-bg-active</li>
					<li>--color-action-primary-bg-disabled</li>
					<li>--color-action-primary-text</li>
					<li>--color-action-primary-text-disabled</li>
				</ul>

				<h3 class="text-h3 mt-6 mb-4">Secondary Variant</h3>
				<ul class="text-p-base space-y-2 font-mono text-sm">
					<li>--color-action-secondary-bg</li>
					<li>--color-action-secondary-bg-hover</li>
					<li>--color-action-secondary-text</li>
					<li>--color-action-secondary-text-hover</li>
					<li>--color-action-secondary-border</li>
					<li>--color-action-secondary-border-hover</li>
				</ul>

				<h3 class="text-h3 mt-6 mb-4">Tertiary Variant</h3>
				<ul class="text-p-base space-y-2 font-mono text-sm">
					<li>--color-action-tertiary-bg</li>
					<li>--color-action-tertiary-bg-hover</li>
					<li>--color-action-tertiary-text</li>
					<li>--color-action-tertiary-text-hover</li>
					<li>--color-action-tertiary-border</li>
					<li>--color-action-tertiary-border-hover</li>
				</ul>

				<h3 class="text-h3 mt-6 mb-4">Typography</h3>
				<ul class="text-p-base space-y-2 font-mono text-sm">
					<li>--font-size-p-sm / --line-height-p-sm (small)</li>
					<li>--font-size-p-base / --line-height-p-base (base)</li>
					<li>--font-size-p-lg / --line-height-p-lg (large)</li>
				</ul>

				<h3 class="text-h3 mt-6 mb-4">Other</h3>
				<ul class="text-p-base space-y-2 font-mono text-sm">
					<li>--radius-lg (border radius)</li>
				</ul>
			</div>
		</section>

		<!-- Accessibility -->
		<section class="mb-12">
			<h2 class="text-h2 mb-4">Accessibility</h2>
			<div class="rounded-lg bg-blue-50 p-6">
				<ul class="text-p-base space-y-3">
					<li>✅ Usa elementos <code>&lt;button&gt;</code> semánticos</li>
					<li>✅ Soporta el atributo <code>disabled</code> nativo</li>
					<li>✅ Cursor <code>not-allowed</code> en estado disabled</li>
					<li>✅ Estados hover y active claramente diferenciados</li>
					<li>✅ Contraste de color adecuado (WCAG AA)</li>
					<li>✅ Transiciones suaves para mejor UX</li>
				</ul>
			</div>
		</section>
	</div>
</Story>
