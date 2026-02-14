<script lang="ts">
	import { NavArrowDown, NavArrowUp, ArrowSeparateVertical } from 'svelte-iconoir';

	/**
	 * Componente reutilizable para cabeceras de tabla ordenables
	 *
	 * @example Uso básico (con ciclo null → asc → desc → null)
	 * ```svelte
	 * <TableSortableHeader
	 *   title="Nombre"
	 *   field="name"
	 *   currentSort={sort}
	 *   onSortChange={(newSort) => applyFilterPatch({ sort: newSort.field, order: newSort.order })}
	 * />
	 * ```
	 *
	 * @example Sin permitir null (ciclo asc ↔ desc)
	 * ```svelte
	 * <TableSortableHeader
	 *   title="Título"
	 *   field="title"
	 *   currentSort={sort}
	 *   onSortChange={(newSort) => applyFilterPatch({ sort: newSort.field, order: newSort.order })}
	 *   config={{ allowNull: false }}
	 * />
	 * ```
	 */

	interface SortState {
		field: string | null;
		order: 'asc' | 'desc' | null;
	}

	interface TableSortableHeaderConfig {
		allowNull: boolean;
	}

	interface Props {
		title: string | undefined;
		field: string;
		currentSort?: { field: string | null; order: 'asc' | 'desc' | null } | null;
		onSortChange: (newSort: SortState) => void;
		config?: Partial<TableSortableHeaderConfig>;
	}

	const DEFAULT_CONFIG: TableSortableHeaderConfig = {
		allowNull: true
	};

	let { title, field, currentSort, onSortChange, config = {} }: Props = $props();

	// Merge de configuración con defaults
	const cfg = $derived({ ...DEFAULT_CONFIG, ...config });

	const isActive = $derived(currentSort?.field === field);
	const isDesc = $derived(currentSort?.order === 'desc');

	function handleClick() {
		const currentOrder = currentSort?.field === field ? currentSort.order : null;
		let newOrder: 'asc' | 'desc' | null;

		if (cfg.allowNull) {
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

<div class="inline-flex gap-2">
	<span class="cursor-pointer" onclick={handleClick} class:text-success={isActive}>{title}</span>
	{#if isActive}
		{#if isDesc}
			<NavArrowDown class="text-success size-4" />
		{:else}
			<NavArrowUp class="text-success size-4" />
		{/if}
	{:else}
		<ArrowSeparateVertical class="text-base-content/30 size-4" />
	{/if}
</div>
