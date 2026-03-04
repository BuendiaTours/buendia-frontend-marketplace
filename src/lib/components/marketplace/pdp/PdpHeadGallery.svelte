<script lang="ts">
	import type { MultimediaItem } from '$lib/types';

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
<div class="relative md:hidden">
	<div class="pdp-head-gallery-mobile-slider flex snap-x snap-mandatory gap-3 overflow-x-auto">
		{#each items as item (item.id)}
			<div class="aspect-square w-full flex-none snap-start overflow-hidden rounded-lg">
				<img
					src={item.variants?.find((v) => v.preset === 'PDP_HEAD_GALLERY_MOBILE')?.url}
					alt={item.altText}
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
