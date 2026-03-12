<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import { BndLightbox } from '$lib/components/marketplace/BndLightbox';
	import type { BndLightboxItem, BndLightboxItemContext } from '$lib/types';

	type Props = {
		items: BndLightboxItem[];
		visibleCount?: number;
		categoryId?: string;
		categoryLabel?: string;
		layoutComponent?: Component<{ ctx: BndLightboxItemContext }>;
		layout?: Snippet<[BndLightboxItemContext]>;
		wrapAround?: boolean;
		wrapperClass?: string;
		thumbClass?: string;
	};

	let {
		items,
		visibleCount,
		categoryId,
		categoryLabel,
		layoutComponent,
		layout,
		wrapAround = true,
		wrapperClass = 'gap-3 flex-wrap',
		thumbClass = 'w-24'
	}: Props = $props();

	let open = $state(false);
	let startIndex = $state(0);

	const visibleItems = $derived(visibleCount != null ? items.slice(0, visibleCount) : items);

	const lbConfig = $derived({
		wrapAround,
		categories: [
			{
				id: categoryId ?? '',
				label: categoryLabel ?? '',
				items,
				...(layoutComponent ? { layoutComponent } : {}),
				...(layout ? { layout } : {})
			}
		],
		startIndex
	});
</script>

<div class="c-gallery-square-thumbs relative flex {wrapperClass}">
	{#each visibleItems as item, i (item.src)}
		<button
			type="button"
			class="relative block aspect-square {thumbClass} cursor-pointer overflow-hidden rounded-md border-none bg-none p-0"
			aria-label={String(item.meta?.user ?? item.alt ?? '')}
			onclick={() => {
				startIndex = i;
				open = true;
			}}
		>
			<img
				src={item.src.replace('w=1200', 'w=200')}
				alt={item.alt ?? ''}
				class="h-full w-full object-cover"
			/>
		</button>
	{/each}
</div>

<BndLightbox bind:open config={lbConfig} />
