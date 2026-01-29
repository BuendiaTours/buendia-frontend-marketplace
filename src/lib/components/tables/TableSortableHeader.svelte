<script lang="ts">
	import { NavArrowDown, NavArrowUp, ArrowSeparateVertical } from 'svelte-iconoir';

	interface SortState {
		field: string | null;
		order: 'asc' | 'desc' | null;
	}

	interface Props {
		title: string | undefined;
		field: string;
		currentSort?: { field: string | null; order: 'asc' | 'desc' | null } | null;
		onSortChange: (newSort: SortState) => void;
		allowNull?: boolean;
	}

	let { title, field, currentSort, onSortChange, allowNull = true }: Props = $props();

	const isActive = $derived(currentSort?.field === field);
	const isDesc = $derived(currentSort?.order === 'desc');

	function handleClick() {
		const currentOrder = currentSort?.field === field ? currentSort.order : null;
		let newOrder: 'asc' | 'desc' | null;

		if (allowNull) {
			newOrder = currentOrder === 'asc' ? 'desc' : currentOrder === 'desc' ? null : 'asc';
		} else {
			newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
		}

		onSortChange({
			field: newOrder ? field : null,
			order: newOrder
		});
	}
</script>

<button type="button" class="btn cursor-pointer pr-2 btn-ghost btn-sm" onclick={handleClick}>
	<span class:text-success={isActive}>{title}</span>

	{#if isActive}
		{#if isDesc}
			<NavArrowDown class="text-success" />
		{:else}
			<NavArrowUp class="text-success" />
		{/if}
	{:else}
		<ArrowSeparateVertical class="text-base-content/30" />
	{/if}
</button>
