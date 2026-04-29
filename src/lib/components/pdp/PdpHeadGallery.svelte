<script lang="ts">
	import type { MultimediaItem } from '$lib/types';
	import { BndLightbox } from '$lib/components/BndLightbox';
	import { BndCssSlider } from '$lib/components/BndCssSlider';
	import GalleryCount from '$lib/components/GalleryCount.svelte';
	import { trackOpenGallery, trackNavigateGallery, trackCompleteGallery } from '$lib/analytics';

	type Props = {
		items: MultimediaItem[];
		wrapperClass?: string;
	};

	let { items, wrapperClass }: Props = $props();

	const desktopVisible = 3;
	const totalImages = $derived(items.length);
	const hiddenCount = $derived(totalImages - desktopVisible);

	let lbOpen = $state(false);
	let lbStartIndex = $state(0);
	const lbItems = $derived(
		items.map((item) => ({
			src: item.variants?.find((v) => v.preset === 'MAX')?.url ?? item.originalUrl ?? '',
			alt: item.altText ?? ''
		}))
	);

	function openAt(index: number, e: MouseEvent) {
		e.preventDefault();
		lbStartIndex = index;
		lbOpen = true;
		trackOpenGallery('provider gallery');
	}
</script>

<!-- Desktop / Tablet gallery -->
<div
	class="pdp-head-gallery hidden md:grid md:[grid-template-columns:472fr_216fr] md:gap-4 lg:[grid-template-columns:502fr_337fr_337fr] {wrapperClass ??
		''}"
>
	<a
		href={items[0].variants?.find((v) => v.preset === 'MAX')?.url}
		onclick={(e) => openAt(0, e)}
		class="aspect-[472/354] overflow-hidden rounded-lg lg:aspect-[502/314]"
	>
		<img
			src={items[0].variants?.find((v) => v.preset === 'PDP_HEAD_GALLERY_1')?.url}
			alt={items[0].altText}
			class="h-full w-full object-cover"
			loading="lazy"
		/>
	</a>
	<div class="flex flex-col gap-4 lg:contents">
		<a
			href={items[1].variants?.find((v) => v.preset === 'MAX')?.url}
			onclick={(e) => openAt(1, e)}
			class="flex-1 overflow-hidden rounded-lg lg:aspect-[337/314]"
		>
			<img
				src={items[1].variants?.find((v) => v.preset === 'PDP_HEAD_GALLERY_1')?.url}
				alt={items[1].altText}
				class="h-full w-full object-cover"
				loading="lazy"
			/>
		</a>
		<a
			href={items[2].variants?.find((v) => v.preset === 'MAX')?.url}
			onclick={(e) => openAt(2, e)}
			class="relative flex-1 overflow-hidden rounded-lg lg:aspect-[337/314]"
		>
			<img
				src={items[2].variants?.find((v) => v.preset === 'PDP_HEAD_GALLERY_1')?.url}
				alt={items[2].altText}
				class="h-full w-full object-cover"
				loading="lazy"
			/>
			<GalleryCount count="+{hiddenCount}" />
		</a>
	</div>
</div>

<!-- Mobile gallery slider -->
<div class="md:hidden">
	<BndCssSlider {items} showCount>
		{#snippet slide(item, i)}
			<a
				href={item.variants?.find((v) => v.preset === 'MAX')?.url}
				onclick={(e) => openAt(i, e)}
				class="h-full w-full"
			>
				<img
					src={item.variants?.find((v) => v.preset === 'PDP_HEAD_GALLERY_MOBILE')?.url}
					alt={item.altText}
					class="h-full w-full object-cover"
					loading="lazy"
				/>
			</a>
		{/snippet}
	</BndCssSlider>
</div>

<BndLightbox
	bind:open={lbOpen}
	config={{
		wrapAround: true,
		categories: [{ id: 'fotos', label: 'Fotos', items: lbItems }],
		startIndex: lbStartIndex
	}}
	onchange={({ index, direction }) => {
		trackNavigateGallery('provider gallery');
		if (direction === 'next' && index === totalImages - 1) trackCompleteGallery('provider gallery');
	}}
/>
