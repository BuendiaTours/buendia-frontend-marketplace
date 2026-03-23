<script lang="ts">
	import StageItem from '../StageItem.svelte';
	import { AltArrowDown } from '$lib/icons/Linear';

	type Props = {
		title?: string;
		items?: Array<{
			id: string;
			order: number;
			name: string;
			description?: string;
			kind: string;
			duration?: string;
		}>;
		wrapperClass?: string;
		initialVisible?: number;
	};

	let { title, wrapperClass, items, initialVisible = 5 }: Props = $props();

	let showAll = $state(false);

	const sorted = $derived((items ?? []).toSorted((a, b) => a.order - b.order));
	const visible = $derived(showAll ? sorted : sorted.slice(0, initialVisible));
</script>

<details open class="pdp-itinerary">
	<summary
		class="flex cursor-pointer items-center justify-between py-4 lg:pointer-events-none lg:cursor-default"
	>
		<h2 class="h2 text-neutral-800">
			{title}
		</h2>
		<AltArrowDown class="shrink-0 grow-0 basis-6 lg:hidden" />
	</summary>
	<div class="pdp-itinerary__stages flex flex-col gap-3">
		{#each visible as item, i (item.id)}
			<StageItem
				name={item.name}
				description={item.description}
				kind={item.kind}
				duration={item.duration}
				index={i}
				total={sorted.length}
			/>
		{/each}
	</div>
	{#if sorted.length > initialVisible && !showAll}
		<button
			class="mt-4 cursor-pointer font-bold text-neutral-800 underline underline-offset-8"
			onclick={() => (showAll = true)}
		>
			Ver todo el itinerario
		</button>
	{/if}
</details>
