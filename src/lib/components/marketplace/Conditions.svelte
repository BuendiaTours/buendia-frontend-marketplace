<script lang="ts">
	import * as Icons from '$lib/icons/Linear';
	import type { Component } from 'svelte';

	type Props = {
		style: string;
		items: Array<{
			id: string;
			icon: string;
			title: string;
			description: string;
		}>;
		wrapperClass?: string;
	};

	let { style, items, wrapperClass }: Props = $props();

	function getIconComponent(iconName: string): Component | null {
		return Icons[iconName as keyof typeof Icons] as Component | null;
	}
</script>

<div
	class={`c-conditions c-conditions_${style} flex flex-col gap-4 rounded-xl p-5 ${wrapperClass || ''}`}
>
	{#each items as item (item.id)}
		{@const IconComponent = getIconComponent(item.icon)}
		<div class="flex gap-2">
			{#if IconComponent}
				<IconComponent class="h-6 shrink-0 grow-0 basis-6" />
			{/if}
			<div class="flex flex-col">
				<p class="p-lg c-conditions-title font-bold">{item.title}</p>
				<p class="p-base text-text-primary">{item.description}</p>
			</div>
		</div>
	{/each}
</div>
