<script lang="ts">
	import * as Icons from '$lib/icons/Linear';
	import type { Component } from 'svelte';

	type Props = {
		style: string;
		size?: 'normal' | 'small';
		items: Array<{
			icon: string;
			title: string;
			description: string;
		}>;
		wrapperClass?: string;
	};

	let { style, size = 'normal', items, wrapperClass }: Props = $props();

	const paddingClass = { normal: 'p-6', small: 'p-3' } as const;
	const titleClass = { normal: 'p-lg', small: 'p-base' } as const;
	const descriptionClass = { normal: 'p-base', small: 'p-sm' } as const;

	function getIconComponent(iconName: string): Component | null {
		return Icons[iconName as keyof typeof Icons] as Component | null;
	}
</script>

<div
	class={`c-callout c-callout__${style} flex flex-col gap-4 rounded-xl ${paddingClass[size]} ${wrapperClass || ''}`}
>
	{#each items as item, i (i)}
		{@const IconComponent = getIconComponent(item.icon)}
		<div class="flex gap-2">
			{#if IconComponent}
				<IconComponent class="h-6 shrink-0 grow-0 basis-6" />
			{/if}
			<div class="flex flex-col">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				<p class="c-callout-title {titleClass[size]}">{@html item.title}</p>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				<div class="{descriptionClass[size]} text-neutral-800">{@html item.description}</div>
			</div>
		</div>
	{/each}
</div>
