<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { BndLightboxItemContext } from '$lib/types';
	import StarRating from '$lib/components/marketplace/StarRating.svelte';

	let { ctx }: { ctx: BndLightboxItemContext } = $props();

	const initial = $derived(ctx.item.meta?.user?.[0]?.toUpperCase() ?? '?');
</script>

<div class="flex h-full items-center justify-center p-4 sm:p-8">
	<div class="flex max-h-full flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
		<!-- Imagen: cross-fade en cada cambio de imagen (grid stacking, no absolute) -->
		<div class="grid [&>*]:[grid-area:1/1]">
			{#key ctx.item.src}
				<img
					src={ctx.item.src}
					alt={ctx.item.alt ?? ''}
					class="max-h-[calc(100dvh-24rem)] max-w-full object-contain"
					transition:fade={{ duration: 300 }}
				/>
			{/key}
		</div>

		<!-- Datos de la review: cross-fade solo cuando cambia de review (reviewIndex) -->
		<div class="w-full shrink-0 sm:w-80">
			{#key ctx.item.meta?.reviewIndex}
				<div class="flex flex-col gap-4 overflow-auto pt-6" transition:fade={{ duration: 200 }}>
					{#if ctx.item.meta}
						<!-- Stars + rating number -->
						<div class="flex items-center gap-2">
							<StarRating value={Number(ctx.item.meta.rating)} size="sm" />
							<span class="h4 text-neutral-900">{ctx.item.meta.rating}</span>
						</div>

						<!-- Avatar + name + date -->
						<div class="flex items-center gap-3">
							<div
								class="flex size-10 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-neutral-100"
							>
								<span class="p-sm font-semibold text-neutral-700">{initial}</span>
							</div>
							<div class="flex flex-col">
								<span class="p-sm font-semibold text-neutral-900">{ctx.item.meta.user}</span>
								<span class="p-xs text-neutral-400">{ctx.item.meta.date}</span>
							</div>
						</div>

						<!-- Review text -->
						<p class="p-sm leading-relaxed text-neutral-700">{ctx.item.meta.content}</p>
					{/if}
				</div>
			{/key}
		</div>
	</div>
</div>

<style>
	:global(.c-star-filled-green) {
		background-color: var(--color-success-700);
	}
</style>
