<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		img?: { src: string; alt: string };
		children: Snippet;
		wrapperClass?: string;
	};

	let { img, children, wrapperClass }: Props = $props();
</script>

<div
	class="pdp-buendia-banner mt-6 mb-6 flex flex-col items-center gap-7 rounded-2xl p-0 lg:flex-row lg:gap-12 lg:border lg:border-solid lg:border-neutral-400 lg:p-12 {wrapperClass ??
		''}"
>
	{#if img}
		<div
			class="relative aspect-[179/103] w-full overflow-hidden rounded-xl sm:aspect-[22/9] lg:aspect-[105/76] lg:shrink-0 lg:grow-0 lg:basis-[420px]"
		>
			<img
				class="absolute inset-0 left-1/2 h-full max-w-none -translate-x-1/2"
				src={img.src}
				alt={img.alt}
			/>
		</div>
	{/if}
	{@render children()}
</div>
