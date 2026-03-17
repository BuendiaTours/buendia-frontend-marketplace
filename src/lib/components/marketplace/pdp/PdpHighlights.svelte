<script lang="ts">
	import Hightlight from './../Hightlight.svelte';

	type Props = {
		items: Array<{ id: string; icon: string; text: string; itsLevel?: boolean }>;
		wrapperClass?: string;
	};

	let { items, wrapperClass }: Props = $props();
</script>

<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6 {wrapperClass}">
	{#if items}
		{#each items as item (item.id)}
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
