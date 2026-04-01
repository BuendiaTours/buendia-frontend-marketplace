<script lang="ts">
	import { browser } from '$app/environment';
	import { tick, type Snippet } from 'svelte';
	import SwiperElement from '$lib/components/shared/Swiper.svelte';
	import { AltArrowLeft, AltArrowRight } from '$lib/icons/Linear';

	type Props = {
		header: Snippet;
		children: Snippet;
		swiperOptions?: Record<string, unknown>;
		wrapperClass: string;
	};

	let { header, children, swiperOptions, wrapperClass }: Props = $props();
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

<div class="c-swipper-manager {wrapperClass}">
	<div class="gp-4 mb-5 flex items-center justify-between lg:mb-6">
		<div class="c-swipper-manager__header">
			{@render header()}
		</div>
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
			options={{ ...swiperOptions, navigation: { prevEl: prevBtn, nextEl: nextBtn } }}
		>
			{@render children()}
		</SwiperElement>
	{/if}
</div>
