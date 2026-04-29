<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		title?: string;
		subtitle?: string;
		imgSrc?: string;
		wrapperClass?: string;
		actions?: Snippet;
	};

	let { title, subtitle, imgSrc, wrapperClass, actions }: Props = $props();
</script>

<div
	class="co-confirmation-hero-img relative flex flex-col items-start gap-6 overflow-hidden rounded-xl bg-[#000] px-5 py-8 sm:gap-7 sm:py-12 lg:gap-8 lg:px-6 lg:py-16 {wrapperClass}"
>
	{#if imgSrc}
		<img src={imgSrc} alt={title} class="absolute inset-0 size-full object-cover opacity-28" />
	{/if}
	{#if title}
		<h1 class="h1-editorial relative text-white">{title}</h1>
	{/if}
	{#if subtitle}
		<p class="p-base relative text-white">{subtitle}</p>
	{/if}
	{#if actions}
		{@render actions()}
	{/if}
</div>
