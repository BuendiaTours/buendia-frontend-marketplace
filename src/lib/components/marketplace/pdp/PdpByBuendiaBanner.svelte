<script lang="ts">
	import Hightlight from './../Hightlight.svelte';

	type Props = {
		title?: string;
		description?: string;
		items?: Array<{
			id: string;
			icon?: string;
			title?: string;
			description?: string;
		}>;
		link?: {
			text: string;
			src: string;
		};
	};

	let { title, description, items, link }: Props = $props();
</script>

<div
	class="mt-2 flex flex-col gap-5 bg-right bg-no-repeat py-4 sm:bg-[url(/marketplace/BrandMark.svg)] lg:py-8"
>
	<div class="flex flex-col gap-2">
		<div class="flex gap-2">
			<img
				class="h-6 shrink-0 grow-0 basis-6"
				src="/marketplace/buendia-logo-small-round.svg"
				alt="by Buendía"
				loading="lazy"
			/>
			<p class="h3 !font-black text-neutral-800">{title}</p>
		</div>
		<p class="text-neutral-700">{description}</p>
	</div>
	<div class="flex flex-col gap-4">
		{#if items}
			{#each items as item (item.id)}
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
	{#if link?.text && link?.src}
		<a class="p font-bold text-neutral-800 underline underline-offset-8" href={link.src}
			>{link.text}</a
		>
	{/if}
</div>
