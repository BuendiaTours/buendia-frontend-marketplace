<script lang="ts">
	import * as Icons from '$lib/icons/Linear';
	import type { Component } from 'svelte';

	type Props = {
		wrapperClass?: string;
		items: Array<{
			icon: string;
			title: string;
			description: string;
		}>;
	};

	let { wrapperClass, items }: Props = $props();

	function getIconComponent(iconName: string): Component | null {
		return Icons[iconName as keyof typeof Icons] as Component | null;
	}
</script>

<div
	class="flex flex-col divide-y divide-neutral-300 rounded-xl border border-solid border-neutral-300 px-5 lg:px-6 {wrapperClass}"
>
	{#each items as item, i (i)}
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
