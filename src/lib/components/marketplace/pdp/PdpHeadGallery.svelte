<script lang="ts">
	import type { MultimediaItem } from '$lib/types';
	// Hicimos una prueba con Swiper para comparar rendimiento y experiencia de usuario contra la implementación nativa con scroll-timeline. Por ahora, dejamos el código comentado para referencia futura.
	// import SwiperElement from '$lib/components/shared/Swiper.svelte';

	type Props = {
		items: MultimediaItem[];
	};

	let { items }: Props = $props();

	const desktopVisible = 3;
	const totalImages = $derived(items.length);
	const hiddenCount = $derived(totalImages - desktopVisible);
</script>

<!-- Desktop / Tablet gallery -->
<div
	class="pdp-head-gallery hidden md:grid md:[grid-template-columns:472fr_216fr] md:gap-4 lg:[grid-template-columns:502fr_337fr_337fr]"
>
	<div class="aspect-[472/354] overflow-hidden rounded-lg lg:aspect-[502/314]">
		<img
			src={items[0].variants?.find((v) => v.preset === 'PDP_HEAD_GALLERY_1')?.url}
			alt={items[0].altText}
			class="h-full w-full object-cover"
			loading="lazy"
		/>
	</div>
	<div class="flex flex-col gap-4 lg:contents">
		<div class="flex-1 overflow-hidden rounded-lg lg:aspect-[337/314]">
			<img
				src={items[1].variants?.find((v) => v.preset === 'PDP_HEAD_GALLERY_1')?.url}
				alt={items[1].altText}
				class="h-full w-full object-cover"
				loading="lazy"
			/>
		</div>
		<div class="relative flex-1 overflow-hidden rounded-lg lg:aspect-[337/314]">
			<img
				src={items[2].variants?.find((v) => v.preset === 'PDP_HEAD_GALLERY_1')?.url}
				alt={items[2].altText}
				class="h-full w-full object-cover"
				loading="lazy"
			/>
			<span
				class="bg-alpha-ink-84 pointer-events-none absolute right-3 bottom-3 rounded-lg border border-neutral-300 p-3 font-bold text-white"
			>
				+{hiddenCount}
			</span>
		</div>
	</div>
</div>

<!-- Mobile gallery slider -->
<div
	class="relative md:hidden"
	style="timeline-scope: --slider-timeline, {items.map((_, i) => `--slide-${i}`).join(', ')};"
>
	<div
		class="pdp-head-gallery-mobile-slider flex snap-x snap-mandatory gap-3 overflow-x-auto"
		style="scroll-timeline-name: --slider-timeline; scroll-timeline-axis: inline;"
	>
		{#each items as item, i (item.id)}
			<div
				class="aspect-square w-full flex-none snap-start snap-always overflow-hidden rounded-lg"
				style="view-timeline-name: --slide-{i}; view-timeline-axis: inline;"
			>
				<img
					src={item.variants?.find((v) => v.preset === 'PDP_HEAD_GALLERY_MOBILE')?.url}
					alt={item.altText}
					class="h-full w-full object-cover"
					loading="lazy"
				/>
			</div>
		{/each}
	</div>

	<!-- Bullets -->
	<div class="absolute bottom-3 flex w-full items-center justify-center">
		<div
			class="pdp-head-gallery-bullets-inner flex items-center gap-1.5"
			style="--n: {items.length}; --ni: {items.length - 1}; animation-timeline: --slider-timeline;"
		>
			<span class="pdp-head-gallery-bullets-dot pdp-head-gallery-bullets-dot--phantom"></span>
			{#each items as _, i (i)}
				<span class="pdp-head-gallery-bullets-dot"></span>
			{/each}
			<span class="pdp-head-gallery-bullets-dot pdp-head-gallery-bullets-dot--phantom"></span>
		</div>
	</div>

	<div
		class="bg-alpha-ink-84 pointer-events-none absolute right-3 bottom-3 rounded-lg border border-neutral-300 p-3 font-bold text-white"
	>
		+{totalImages}
	</div>
</div>

<!-- Mobile gallery slider — Swiper (test comparativo) -->
<!-- div class="overflow-hidden rounded-lg md:hidden">
	<SwiperElement
		className="pdp-head-gallery-swiper aspect-square rounded-lg"
		options={{
			slidesPerView: 1,
			spaceBetween: 12,
			pagination: { clickable: false },
			loop: false
		}}
	>
		{#each items as item (item.id)}
			<swiper-slide>
				<img
					src={item.variants?.find((v) => v.preset === 'PDP_HEAD_GALLERY_MOBILE')?.url}
					alt={item.altText}
					class="h-full w-full object-cover"
					loading="lazy"
				/>
			</swiper-slide>
		{/each}
	</SwiperElement>
</div -->

<style>
	.pdp-head-gallery-mobile-slider {
		scrollbar-width: none;
		-webkit-overflow-scrolling: touch;
		&::-webkit-scrollbar {
			display: none;
		}
	}

	/* Container shift */
	@supports (animation-timeline: scroll()) {
		.pdp-head-gallery-bullets-inner {
			animation-name: pdp-bullet-shift;
			animation-timing-function: linear;
			animation-fill-mode: none;
			animation-iteration-count: var(--ni);
			animation-timeline: --slider-timeline;
		}

		/* LEFT: base 1 → shrinks to 0.5 → snaps back to 1 */
		.pdp-head-gallery-bullets-inner .pdp-head-gallery-bullets-dot:nth-child(4) {
			animation-name: pdp-bullet-exit-half;
			animation-timing-function: linear;
			animation-fill-mode: none;
			animation-iteration-count: var(--ni);
			animation-timeline: --slider-timeline;
		}

		/* LEFT: base 0.5 → shrinks to 0 → snaps back to 0.5 */
		.pdp-head-gallery-bullets-inner .pdp-head-gallery-bullets-dot:nth-child(3) {
			animation-name: pdp-bullet-exit-full;
			animation-timing-function: linear;
			animation-fill-mode: none;
			animation-iteration-count: var(--ni);
			animation-timeline: --slider-timeline;
		}

		/* RIGHT: base 0 → grows to 0.5 → snaps back to 0 */
		.pdp-head-gallery-bullets-inner .pdp-head-gallery-bullets-dot:nth-last-child(2) {
			animation-name: pdp-bullet-enter-small;
			animation-timing-function: linear;
			animation-fill-mode: none;
			animation-iteration-count: var(--ni);
			animation-timeline: --slider-timeline;
		}

		/* RIGHT: base 0.5 → grows to 1 → snaps back to 0.5 */
		.pdp-head-gallery-bullets-inner .pdp-head-gallery-bullets-dot:nth-last-child(3) {
			animation-name: pdp-bullet-enter-full;
			animation-timing-function: linear;
			animation-fill-mode: none;
			animation-iteration-count: var(--ni);
			animation-timeline: --slider-timeline;
		}
	}

	.pdp-head-gallery-bullets-dot {
		width: 8px;
		height: 8px;
		border-radius: 9999px;
		background: #000;
		flex-shrink: 0;
		opacity: 0.5;

		&.pdp-head-gallery-bullets-dot--phantom {
			transform: scale(0);
			opacity: 0;
		}
	}

	.pdp-head-gallery-bullets-inner {
		/* scale(0) is sufficient for invisibility — no opacity:0 needed */
		.pdp-head-gallery-bullets-dot:nth-child(2),
		.pdp-head-gallery-bullets-dot:nth-last-child(2) {
			transform: scale(0);
		}

		.pdp-head-gallery-bullets-dot:nth-child(3),
		.pdp-head-gallery-bullets-dot:nth-last-child(3) {
			transform: scale(0.5);
		}
	}

	@keyframes pdp-bullet-enter-small {
		from {
			transform: scale(0);
		}
		to {
			transform: scale(0.5);
		}
	}

	@keyframes pdp-bullet-enter-full {
		from {
			transform: scale(0.5);
		}
		to {
			transform: scale(1);
		}
	}

	@keyframes pdp-bullet-exit-half {
		from {
			transform: scale(1);
		}
		to {
			transform: scale(0.5);
		}
	}

	@keyframes pdp-bullet-exit-full {
		from {
			transform: scale(0.5);
		}
		to {
			transform: scale(0);
		}
	}

	@keyframes pdp-bullet-shift {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-14px);
		}
	}
</style>
