<!--
  @component BndCssSlider

  Slider horizontal CSS-only: sin JS de animación, sin librerías externas.
  Usa CSS Scroll-Driven Animations (scroll-timeline + view-timeline) para los
  bullets animados y el indicador de posición. Soporta múltiples instancias en
  la misma página gracias a timeline names únicos por instancia (uid).

  Requiere los estilos globales de `c-bnd-css-slider.css` (incluidos vía
  `layout-marketplace.css`).

  @prop items       - Array de items. Cada item debe tener un campo `id` único
                      (string | number). El tipo `T` se infiere automáticamente,
                      por lo que el snippet `slide` estará tipado con el tipo real.

  @prop slideClass  - Clases Tailwind para el wrapper de cada slide.
                      Default: `aspect-square w-full flex-none snap-start snap-always
                      overflow-hidden rounded-lg`

  @prop showCount   - Muestra una badge "+N" en la esquina inferior derecha con
                      el total de slides. Default: false.

  @snippet slide(item, i) - Contenido de cada slide. Recibe el item tipado y su índice.
                            Se renderiza dentro del wrapper con `slideClass`.

  @example Uso básico con imágenes
  ```svelte
  <BndCssSlider {items}>
    {#snippet slide(item, i)}
      <img src={item.imageUrl} alt={item.alt} class="h-full w-full object-cover" />
    {/snippet}
  </BndCssSlider>
  ```

  @example Con badge de contador y aspect ratio personalizado
  ```svelte
  <BndCssSlider
    {items}
    showCount
    slideClass="aspect-[4/3] w-full flex-none snap-start snap-always overflow-hidden rounded-xl"
  >
    {#snippet slide(item, i)}
      <a href={item.href} class="h-full w-full">
        <img src={item.src} alt={item.alt} class="h-full w-full object-cover" />
      </a>
    {/snippet}
  </BndCssSlider>
  ```

  @example Slides de ancho fijo (no fullwidth)
  ```svelte
  <BndCssSlider items={reviews} slideClass="w-72 flex-none snap-start snap-always rounded-lg">
    {#snippet slide(review, i)}
      <div class="bg-white p-4 shadow">
        <p>{review.text}</p>
      </div>
    {/snippet}
  </BndCssSlider>
  ```
-->
<script lang="ts" generics="T extends { id: string | number }">
	import type { Snippet } from 'svelte';

	type Props = {
		/** Array de items a mostrar. `T` se infiere del tipo pasado. */
		items: T[];
		/** Clases Tailwind para el wrapper de cada slide. */
		slideClass?: string;
		/** Muestra una badge "+N" con el total de slides. */
		showCount?: boolean;
		/** Snippet con el contenido de cada slide. Recibe (item: T, index: number). */
		slide: Snippet<[T, number]>;
	};

	let {
		items,
		slideClass = 'aspect-square w-full flex-none snap-start snap-always overflow-hidden rounded-lg',
		showCount = false,
		slide
	}: Props = $props();

	const uid = Math.random().toString(36).slice(2, 7);
	const tlName = `--bnd-slider-${uid}-tl`;

	const timelineScope = $derived(
		`${tlName}, ${items.map((_, i) => `--bnd-slide-${uid}-${i}`).join(', ')}`
	);
</script>

<div
	class="relative"
	style="--bnd-slider-tl: {tlName}; --n: {items.length}; --ni: {items.length -
		1}; timeline-scope: {timelineScope};"
>
	<!-- Scroll container -->
	<div
		class="bnd-css-slider-track flex snap-x snap-mandatory gap-3 overflow-x-auto"
		style="scroll-timeline-name: {tlName}; scroll-timeline-axis: inline;"
	>
		{#each items as item, i (item.id)}
			<div
				class={slideClass}
				style="view-timeline-name: --bnd-slide-{uid}-{i}; view-timeline-axis: inline;"
			>
				{@render slide(item, i)}
			</div>
		{/each}
	</div>

	<!-- Bullets -->
	<div class="pointer-events-none absolute bottom-3 flex w-full items-center justify-center">
		<div class="bnd-css-slider-bullets flex items-center gap-1.5">
			<span class="bnd-css-slider-dot bnd-css-slider-dot--phantom"></span>
			{#each items as _, i (i)}
				<span class="bnd-css-slider-dot"></span>
			{/each}
			<span class="bnd-css-slider-dot bnd-css-slider-dot--phantom"></span>
		</div>
	</div>

	<!-- Optional count badge -->
	{#if showCount}
		<div
			class="bg-alpha-ink-84 pointer-events-none absolute right-3 bottom-3 rounded-lg border border-neutral-300 p-3 font-bold text-white"
		>
			+{items.length}
		</div>
	{/if}
</div>

<style>
	.bnd-css-slider-track {
		scrollbar-width: none;
		-webkit-overflow-scrolling: touch;
		&::-webkit-scrollbar {
			display: none;
		}
	}
</style>
