<script lang="ts">
	import type { BreadcrumbItem } from '$lib/types/google-maps';
	// import { Home } from 'svelte-iconoir';

	interface Props {
		items: BreadcrumbItem[];
	}

	let { items }: Props = $props();
</script>

<div class="breadcrumbs text-sm">
	<ul>
		{#each items as item, index}
			<li>
				{#if index === items.length - 1}
					<span class="font-semibold">{item.label}</span>
				{:else if item.href}
					<a href={item.href}>{item.label}</a>
				{:else}
					<span>{item.label}</span>
				{/if}
			</li>
		{/each}
	</ul>
</div>
