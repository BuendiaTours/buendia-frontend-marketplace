<script lang="ts">
	import * as Icons from '$lib/icons/Linear';
	import type { Component } from 'svelte';

	type Props = {
		wrapperClass?: string;
		title?: string;
		items: Array<{
			id: string;
			icon: string;
			title: string;
			description: string;
		}>;
	};

	let { wrapperClass, title, items }: Props = $props();

	function getIconComponent(iconName: string): Component | null {
		return Icons[iconName as keyof typeof Icons] as Component | null;
	}
</script>

{#if title}
	<h2 class="h2 mb-5 text-neutral-800 lg:mb-6">
		{title}
	</h2>
{/if}
<div
	class="flex flex-col divide-y divide-neutral-300 rounded-xl border border-solid border-neutral-300 px-5 lg:px-6 {wrapperClass}"
>
	{#each items as item (item.id)}
		{@const IconComponent = getIconComponent(item.icon)}
		<div class="flex flex-col gap-1.5 py-5 lg:py-6">
			<p class="p-lg flex gap-1.5 font-bold text-neutral-800">
				{#if IconComponent}
					<IconComponent class="h-6 shrink-0 grow-0 basis-6" />
				{/if}
				{item.title}
			</p>
			<div class="p-base text-neutral-700">
				{item.description}
			</div>
		</div>
	{/each}
</div>
