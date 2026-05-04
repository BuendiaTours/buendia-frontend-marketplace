<script lang="ts">
	import Hightlight from './../Hightlight.svelte';

	type Props = {
		items: Array<{ icon: string; text: string; itsLevel?: boolean }>;
		wrapperClass?: string;
	};

	let { items, wrapperClass }: Props = $props();
</script>

<div class="pdp-highlights grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6 {wrapperClass}">
	{#if items}
		{#each items as item, i (i)}
			<Hightlight
				data={{
					icon: item.icon,
					description: item.text,
					descriptionColor: 'text-neutral-800',
					itsLevel: item.itsLevel
				}}
			/>
		{/each}
	{/if}
</div>
