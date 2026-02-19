<script lang="ts">
	import type { BreadcrumbItem } from '$lib/types';
	import { Home } from '@solar-icons/svelte/Outline';

	type Props = {
		items: BreadcrumbItem[];
	};

	let { items }: Props = $props();
</script>

<div class="breadcrumbs text-sm">
	<ul>
		{#each items as item, index (index)}
			<li>
				{#if index === items.length - 1}
					<span class="font-semibold">
						{#if item.label === 'Inicio'}
							<Home class="inline size-4" />
						{/if}
						{item.label}
					</span>
				{:else if item.href}
					<a href={item.href}>
						{#if item.label === 'Inicio'}
							<Home class="inline size-4" />
						{/if}
						{item.label}
					</a>
				{:else}
					<span>
						{#if item.label === 'Inicio'}
							<Home class="inline size-4" />
						{/if}
						{item.label}
					</span>
				{/if}
			</li>
		{/each}
	</ul>
</div>
