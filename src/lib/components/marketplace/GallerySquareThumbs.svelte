<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import { BndLightbox } from '$lib/components/marketplace/BndLightbox';
	import GalleryCount from '$lib/components/marketplace/GalleryCount.svelte';
	import type { BndLightboxItem, BndLightboxItemContext } from '$lib/types';

	type Props = {
		categoryId?: string;
		categoryLabel?: string;
		containerClass?: string;
		items: BndLightboxItem[];
		layout?: Snippet<[BndLightboxItemContext]>;
		layoutComponent?: Component<{ ctx: BndLightboxItemContext }>;
		showCount?: boolean;
		thumbClass?: string;
		visibleCount?: number;
		wrapAround?: boolean;
		wrapperClass?: string;
	};

	let {
		categoryId,
		categoryLabel,
		containerClass = '',
		items,
		layout,
		layoutComponent,
		showCount = false,
		thumbClass = 'w-24',
		visibleCount,
		wrapAround = true,
		wrapperClass = 'gap-3 flex-wrap'
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

<div class="c-gallery-square-thumbs @container {containerClass}">
	<div class="relative flex {wrapperClass}">
		{#each visibleItems as item, i (item.src)}
			<button
				type="button"
				class="relative block aspect-square cursor-pointer overflow-hidden rounded-md border-none bg-none p-0 {thumbClass}"
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
				{#if showCount && i === visibleItems.length - 1}
					<GalleryCount count="+{items.length}" />
				{/if}
			</button>
		{/each}
	</div>
</div>

<BndLightbox bind:open config={lbConfig} />
