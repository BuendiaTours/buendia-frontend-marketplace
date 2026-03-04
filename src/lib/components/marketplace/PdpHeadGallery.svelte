<script lang="ts">
	const mobileSlides = Array.from({ length: 12 }, (_, i) => i);
</script>

<!-- Desktop / Tablet gallery -->
<div class="pdp-head-gallery hidden md:grid md:[grid-template-columns:502fr_337fr_337fr] md:gap-4">
	<div class="aspect-[472/354] overflow-hidden rounded-lg md:aspect-[502/314]">
		<img
			src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
			alt="Imagen de la actividad"
			class="h-full w-full object-cover"
		/>
	</div>
	<div class="flex flex-col gap-4 md:contents">
		<div class="flex-1 overflow-hidden rounded-lg md:aspect-[337/314]">
			<img
				src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
				alt="Imagen de la actividad"
				class="h-full w-full object-cover"
			/>
		</div>
		<div class="flex-1 overflow-hidden rounded-lg md:aspect-[337/314]">
			<img
				src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
				alt="Imagen de la actividad"
				class="h-full w-full object-cover"
			/>
		</div>
	</div>
</div>

<!-- Mobile gallery slider -->
<div
	class="pdp-head-gallery-mobile-slider flex snap-x snap-mandatory gap-3 overflow-x-auto md:hidden"
>
	{#each mobileSlides as i (i)}
		<div class="aspect-square w-full flex-none snap-start overflow-hidden rounded-lg">
			<img
				src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
				alt="Imagen {i + 1}"
				class="h-full w-full object-cover"
			/>
		</div>
	{/each}
</div>

<style>
	.pdp-head-gallery-mobile-slider {
		scrollbar-width: none;
		-webkit-overflow-scrolling: touch;
	}
	.pdp-head-gallery-mobile-slider::-webkit-scrollbar {
		display: none;
	}
</style>
