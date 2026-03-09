<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { BndLightboxItemContext } from '$lib/types';
	import StarRating from '$lib/components/marketplace/StarRating.svelte';

	let { ctx }: { ctx: BndLightboxItemContext } = $props();
</script>

<div class="flex h-full flex-col sm:flex-row">
	<!-- Imagen: cross-fade en cada cambio de imagen -->
	<div class="relative min-h-0 flex-1">
		{#key ctx.item.src}
			<div
				class="absolute inset-0 flex items-center justify-center bg-black/20 p-4 sm:p-8"
				transition:fade={{ duration: 300 }}
			>
				<img
					src={ctx.item.src}
					alt={ctx.item.alt ?? ''}
					class="max-h-full max-w-full object-contain"
				/>
			</div>
		{/key}
	</div>

	<!-- Datos de la review: cross-fade solo cuando cambia de review (reviewIndex) -->
	<div class="relative h-48 w-full shrink-0 sm:h-full sm:w-72">
		{#key ctx.item.meta?.reviewIndex}
			<div
				class="absolute inset-0 flex flex-col justify-center gap-3 overflow-auto bg-white/5 p-6"
				transition:fade={{ duration: 200 }}
			>
				{#if ctx.item.meta}
					<p class="font-semibold text-white">{ctx.item.meta.user}</p>
					<p class="p-xs text-white/50">{ctx.item.meta.date}</p>
					<StarRating value={Number(ctx.item.meta.rating)} />
					<p class="p-sm leading-relaxed text-white/80">{ctx.item.meta.content}</p>
				{/if}
			</div>
		{/key}
	</div>
</div>
