<script lang="ts">
	import { browser } from '$app/environment';
	import { tick, type Snippet } from 'svelte';
	import SwiperElement from '$lib/components/Swiper.svelte';
	import { AltArrowLeft, AltArrowRight } from '$lib/icons/Linear';

	type Props = {
		header: Snippet;
		children: Snippet;
		swiperOptions?: Record<string, unknown>;
		wrapperClass: string;
		id?: string;
	};

	let { header, children, swiperOptions, wrapperClass, id }: Props = $props();
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

<div {id} class="plp-swipper {wrapperClass}">
	<div class="mb-5 flex items-center justify-between gap-4 lg:mb-6">
		<div class="c-swipper-manager__header w-full">
			{@render header()}
		</div>
		<div class="hidden gap-2 lg:flex">
			<button bind:this={prevBtn} class="e-nav-button rounded-full" aria-label="Anterior">
				<AltArrowLeft class="size-4" />
			</button>
			<button bind:this={nextBtn} class="e-nav-button rounded-full" aria-label="Siguiente">
				<AltArrowRight class="size-4" />
			</button>
		</div>
	</div>

	{#if buttonsReady}
		<SwiperElement
			className="-mr-4 sm:-mr-8 lg:mr-0 flex"
			options={{ ...swiperOptions, navigation: { prevEl: prevBtn, nextEl: nextBtn } }}
		>
			{@render children()}
		</SwiperElement>
	{/if}
</div>

<style>
	:global(.plp-swipper .swiper-wrapper) {
		align-items: stretch;
	}
	:global(.plp-swipper swiper-slide) {
		height: auto;
	}
</style>
