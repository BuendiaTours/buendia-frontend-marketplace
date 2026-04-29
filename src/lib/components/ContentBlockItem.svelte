<script lang="ts">
	import type { ContentBlockStack } from '$lib/types';
	import { trackVerMas } from '$lib/analytics';

	type Props = {
		item: ContentBlockStack;
	};

	let { item }: Props = $props();

	let expanded = $state(false);
	let el: HTMLElement | undefined = $state(undefined);
	let overflows = $state(false);

	$effect(() => {
		if (el) {
			const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
			overflows = el.scrollHeight > Math.ceil(lineHeight * 3);
		}
	});
</script>

<div
	class="flex flex-col gap-6 sm:flex-row sm:gap-7 {expanded
		? 'w-full'
		: 'basis-[calc(50%-24px)]'} lg:shrink-0 lg:grow-0"
>
	<div
		class="h-[190px] overflow-hidden rounded-lg sm:shrink-0 sm:grow-0 sm:basis-[318px] lg:basis-[190px]"
	>
		<img src={item.image} alt={item.title} class="h-full w-full object-cover" />
	</div>
	<div class="flex flex-col gap-3">
		<p class="h4-editorial text-neutral-800">
			{item.title}
		</p>
		<div
			bind:this={el}
			class="p-base-editorial text-neutral-700 {expanded
				? '[&_p:not(:last-child)]:pb-2'
				: 'line-clamp-3'} [&_a]:text-neutral-700 [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-neutral-900 [$_a]:font-bold"
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- API content, sanitized server-side -->
			{@html item.description}
		</div>
		{#if overflows || expanded}
			<button
				class="p-base cursor-pointer self-start text-neutral-800 underline underline-offset-8"
				onclick={() => {
					if (!expanded) trackVerMas(item.title);
					expanded = !expanded;
				}}
			>
				{expanded ? 'Ver menos' : 'Ver más'}
			</button>
		{/if}
	</div>
</div>
