<script lang="ts">
	import Hightlight from './Hightlight.svelte';
	import { ByBuendia } from '$lib/icons/Linear';
	import type { ByBuendiaBanner } from '$lib/types';

	type Props = {
		banner: ByBuendiaBanner;
		wrapperClass?: string;
	};

	let { banner, wrapperClass }: Props = $props();
</script>

<div class="flex flex-col lg:flex-row lg:flex-wrap {wrapperClass}">
	{#if banner.title}
		<h2 class="h2-editorial mb-2 text-neutral-800">
			{banner.title}
		</h2>
	{/if}
	{#if banner.description}
		<p class="p-lg-editorial mb-5 text-neutral-800">
			{banner.description}
		</p>
	{/if}
	<div
		class="flex flex-col items-center lg:w-full lg:flex-row lg:gap-12 {banner.image
			? 'lg:rounded-2xl lg:border lg:border-solid lg:border-neutral-400 lg:p-12'
			: ''}"
	>
		{#if banner.image}
			<div
				class="relative mb-6 aspect-[179/103] w-full overflow-hidden rounded-xl sm:aspect-[22/9] lg:mb-0 lg:aspect-[105/76] lg:shrink-0 lg:grow-0 lg:basis-[420px]"
			>
				<img
					class="absolute inset-0 left-1/2 h-full max-w-none -translate-x-1/2"
					src={banner.image}
					alt={banner.title}
				/>
			</div>
		{/if}
		<div
			class="pdp-by-buendia-banner flex w-full shrink grow-0 basis-full flex-col gap-5 bg-right bg-no-repeat {!banner.image
				? 'sm:bg-[url(/marketplace/BrandMark.svg)]'
				: ''}"
		>
			<div class="flex flex-col gap-2">
				<div class="flex gap-2">
					<ByBuendia class="h-6 shrink-0 grow-0 basis-6" />
					<p class="h3 !font-black text-neutral-800">
						<!-- {title} -->
						Plan by buendía
					</p>
				</div>
				{#if banner.itemsDescription}
					<p class="text-neutral-700">{banner.itemsDescription}</p>
				{/if}
			</div>
			<div class="flex flex-col gap-4">
				{#if banner.items}
					{#each banner.items as item (item.id)}
						<Hightlight
							data={{
								icon: item.icon,
								title: item.title,
								description: item.description
							}}
						/>
					{/each}
				{/if}
			</div>
			{#if banner.link?.text && banner.link?.src}
				<a
					class="p cursor-pointer font-bold text-neutral-800 underline underline-offset-8"
					href={banner.link.src}>{banner.link.text}</a
				>
			{/if}
		</div>
	</div>
</div>
