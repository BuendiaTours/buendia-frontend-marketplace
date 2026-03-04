<script lang="ts">
	const mobileSlides = Array.from({ length: 12 }, (_, i) => i);
	const totalImages = mobileSlides.length;
	const desktopVisible = 3;
	const hiddenCount = totalImages - desktopVisible;

	import type { MultimediaItem } from '$lib/types';

	type Props = {
		items: MultimediaItem[];
	};

	let { items }: Props = $props();
</script>

<!-- Desktop / Tablet gallery -->
<div
	class="pdp-head-gallery hidden md:grid md:[grid-template-columns:472fr_216fr] md:gap-4 lg:[grid-template-columns:502fr_337fr_337fr]"
>
	<div class="aspect-[472/354] overflow-hidden rounded-lg lg:aspect-[502/314]">
		<img
			src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
			alt="Imagen de la actividad"
			class="h-full w-full object-cover"
			loading="lazy"
		/>
	</div>
	<div class="flex flex-col gap-4 lg:contents">
		<div class="flex-1 overflow-hidden rounded-lg lg:aspect-[337/314]">
			<img
				src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
				alt="Imagen de la actividad"
				class="h-full w-full object-cover"
				loading="lazy"
			/>
		</div>
		<div class="relative flex-1 overflow-hidden rounded-lg lg:aspect-[337/314]">
			<img
				src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
				alt="Imagen de la actividad"
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
<div class="relative md:hidden">
	<div class="pdp-head-gallery-mobile-slider flex snap-x snap-mandatory gap-3 overflow-x-auto">
		{#each mobileSlides as i (i)}
			<div class="aspect-square w-full flex-none snap-start overflow-hidden rounded-lg">
				<img
					src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
					alt="Imagen {i + 1}"
					class="h-full w-full object-cover"
					loading="lazy"
				/>
			</div>
		{/each}
	</div>
	<span
		class="bg-alpha-ink-84 pointer-events-none absolute right-3 bottom-3 rounded-lg border border-neutral-300 p-3 font-bold text-white"
	>
		+{totalImages}
	</span>
</div>

<style>
	.pdp-head-gallery-mobile-slider {
		scrollbar-width: none;
		-webkit-overflow-scrolling: touch;
		&::-webkit-scrollbar {
			display: none;
		}
	}
</style>
