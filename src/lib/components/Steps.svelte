<script lang="ts">
	import StepsItem from './StepsItem.svelte';

	type StepItem = {
		text: string;
		url?: string;
		active?: boolean;
		disabled?: boolean;
	};

	type Props = {
		items: StepItem[];
		wrapperClass?: string;
	};

	let { items, wrapperClass }: Props = $props();

	const lastActiveIndex = $derived(items.reduce((acc, item, i) => (item.active ? i : acc), -1));
</script>

<div class="flex flex-wrap gap-4 {wrapperClass}">
	{#each items as item, i (i)}
		<StepsItem
			step={i + 1}
			text={item.text}
			active={item.active}
			done={item.active && i < lastActiveIndex}
			slug={item.url}
			disabled={item.disabled}
		/>
	{/each}
</div>
