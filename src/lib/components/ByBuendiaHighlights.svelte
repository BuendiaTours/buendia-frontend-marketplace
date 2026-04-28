<script lang="ts">
	import Hightlight from './Hightlight.svelte';
	import { ByBuendia } from '$lib/icons/Linear';
	// import type { ByBuendiaBanner } from '$lib/types';

	type Props = {
		data: {
			title?: string;
			description?: string;
			items?: {
				icon: string;
				title: string;
				description: string;
			}[];
			link?: {
				text: string;
				src: string;
			};
		};
		onlinkclick?: () => void;
		wrapperClass?: string;
	};

	let { data, onlinkclick, wrapperClass }: Props = $props();
</script>

<div
	class="pdp-by-buendia-banner flex w-full shrink grow-0 basis-full flex-col gap-5 bg-right bg-no-repeat {wrapperClass}"
>
	<div class="flex flex-col gap-2">
		<div class="flex gap-2">
			<ByBuendia class="h-6 shrink-0 grow-0 basis-6" />
			<p class="h3 !font-black text-neutral-800">{data.title || 'Plan by buendía'}</p>
		</div>
		{#if data.description}
			<p class="text-neutral-700">{data.description}</p>
		{/if}
	</div>
	<div class="flex flex-col gap-4">
		{#if data.items}
			{#each data.items as item, i (i)}
				<Hightlight
					data={{
						icon: item.icon,
						title: item.title,
						description: item.description,
						boldTitle: true
					}}
				/>
			{/each}
		{/if}
	</div>
	{#if data.link?.text && data.link?.src}
		<a
			class="p cursor-pointer font-bold text-neutral-800 underline underline-offset-8"
			href={data.link.src}
			onclick={onlinkclick}>{data.link.text}</a
		>
	{/if}
</div>
