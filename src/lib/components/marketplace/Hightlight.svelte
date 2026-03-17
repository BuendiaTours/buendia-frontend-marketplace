<script lang="ts">
	import * as Icons from '$lib/icons/Linear';
	import type { Component } from 'svelte';

	type Condition = {
		icon?: string;
		title: string;
		description: string;
	};

	let { data }: { data: Condition } = $props();

	const IconComponent = $derived(
		data.icon ? (Icons[data.icon as keyof typeof Icons] as Component) : null
	);
</script>

<div class="flex items-start gap-3">
	{#if IconComponent}
		<div
			class="flex items-center justify-center rounded-lg border border-solid border-neutral-300 bg-white p-3"
		>
			<IconComponent class="h-6 shrink-0 grow-0 basis-6 text-neutral-800" />
		</div>
	{/if}
	<div class="flex flex-col">
		{#if data.title}
			<p class="p-lg font-bold text-neutral-800">
				{data.title}
			</p>
		{/if}
		{#if data.description}
			<p class="p text-neutral-700">
				{data.description}
			</p>
		{/if}
	</div>
</div>
