<script lang="ts">
	import type { ActivityMeetingPoint } from '$lib/types';
	import Spacer from '../Spacer.svelte';
	import PdpCollectionPoint from './PdpCollectionPoint.svelte';
	import { trackVerMas } from '$lib/analytics';

	type Props = {
		items: ActivityMeetingPoint[];
		visibleCount?: number;
	};

	let { items, visibleCount = 3 }: Props = $props();

	let showAll = $state(false);

	const visibleItems = $derived(showAll ? items : items.slice(0, visibleCount));
</script>

<div class="c-collection-points-group">
	<div class="h2 mb-4">Puntos de encuentro</div>

	<div class="space-y-4">
		{#each visibleItems as item, i (i)}
			<PdpCollectionPoint data={item} />

			{#if i < visibleItems.length - 1}
				<Spacer margin="mt-4 mb-4" lineColor="border-[var(--color-neutral-200)]" />
			{/if}
		{/each}
	</div>

	{#if items.length > visibleCount && !showAll}
		<button
			class="mt-4 cursor-pointer font-bold text-neutral-800 underline underline-offset-8"
			onclick={() => {
				showAll = true;
				trackVerMas('puntos de encuentro');
			}}
		>
			Ver más
		</button>
	{/if}
</div>
