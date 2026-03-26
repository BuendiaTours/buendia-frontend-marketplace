<script lang="ts">
	import type { PlpAttractionItem as PlpAttractionItemType } from '$lib/types';
	import { browser } from '$app/environment';
	import { tick } from 'svelte';
	import SwiperElement from '$lib/components/shared/Swiper.svelte';
	import PlpAttractionItem from './PlpAttractionItem.svelte';
	import { AltArrowLeft, AltArrowRight } from '$lib/icons/Linear';

	type Props = {
		title: string;
		items: PlpAttractionItemType[];
		wrapperClass: string;
	};

	let { title, items, wrapperClass }: Props = $props();
	let prevBtn: HTMLButtonElement | undefined = $state(undefined);
	let nextBtn: HTMLButtonElement | undefined = $state(undefined);
	let buttonsReady = $state(false);

	$effect(() => {
		if (!browser) return;
		tick().then(() => {
			buttonsReady = true;
		});
	});
</script>

<div class={wrapperClass}>
	<div class="mb-5 flex items-center justify-between lg:mb-6">
		<h2 class="h2-editorial text-neutral-800">{title}</h2>
		<div class="hidden gap-2 lg:flex">
			<button bind:this={prevBtn} class="e-nav-button" aria-label="Anterior">
				<AltArrowLeft class="size-4" />
			</button>
			<button bind:this={nextBtn} class="e-nav-button" aria-label="Siguiente">
				<AltArrowRight class="size-4" />
			</button>
		</div>
	</div>

	{#if buttonsReady}
		<SwiperElement
			className="-mr-4 sm:-mr-8 lg:mr-0"
			options={{
				slidesPerView: 'auto',
				spaceBetween: 16,
				navigation: { prevEl: prevBtn, nextEl: nextBtn },
				loop: false
			}}
		>
			{#each items as attraction (attraction.id)}
				<swiper-slide
					class="relative aspect-[34/19] w-[340px] overflow-hidden rounded-xl sm:aspect-[340/314] lg:aspect-[392/314] lg:w-[392px]"
				>
					<PlpAttractionItem item={attraction} />
				</swiper-slide>
			{/each}
		</SwiperElement>
	{/if}
</div>
