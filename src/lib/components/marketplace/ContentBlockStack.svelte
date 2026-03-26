<script lang="ts">
	import type { ContentBlockStack } from '$lib/types';
	import ContentBlockItem from './ContentBlockItem.svelte';

	type Props = {
		items: ContentBlockStack[];
		title: string;
		wrapperClass?: string;
	};

	let { items, title, wrapperClass }: Props = $props();
</script>

<div class={wrapperClass}>
	<h2 class="h2-editorial mb-4 pb-5 text-neutral-800 lg:pb-6">
		{title}
	</h2>

	<div class="flex flex-col gap-7 lg:flex-row lg:flex-wrap lg:gap-12">
		{#each items as item (item.id)}
			<ContentBlockItem {item} />
		{/each}
	</div>
</div>
