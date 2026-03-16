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

<div
	class="bg-info-100 border-info-300 mt-4 mb-4 flex flex-col gap-2 rounded-xl border border-solid p-5 lg:mt-8 lg:mb-8"
>
	<div class="flex gap-2">
		{#if IconComponent}
			<IconComponent class="h-6 shrink-0 grow-0 basis-6 text-neutral-800" />
		{/if}
		<h3 class="h3 text-neutral-800">{data.title}</h3>
	</div>
	<p class="p text-neutral-800">{data.description}</p>
</div>
