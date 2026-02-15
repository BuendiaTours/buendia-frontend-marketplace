<script lang="ts">
	import { Cancel } from 'svelte-iconoir';

	type Option = {
		id: string;
		name: string;
		[key: string]: unknown;
	};

	let {
		options,
		filterKey,
		currentValue = undefined,
		placeholder = 'Selecciona una opción',
		clearTooltip = 'Limpiar filtro',
		width = 'w-44',
		onFilterChange
	}: {
		options: readonly Option[] | Option[];
		filterKey: string;
		currentValue?: string | undefined;
		placeholder?: string;
		clearTooltip?: string;
		width?: string;
		onFilterChange: (filterKey: string, value: string | null) => void;
	} = $props();

	let selectedValue = $derived(currentValue);

	function handleChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		const value = target.value;
		selectedValue = value || undefined;
		onFilterChange(filterKey, value || null);
	}

	function handleClear() {
		selectedValue = undefined;
		onFilterChange(filterKey, null);
	}
</script>

<!--
	FilterSelect - Selector de filtros con opciones estáticas

	@example
	```svelte
	<script>
	  import FilterSelect from '$lib/components/backoffice/filters/FilterSelect.svelte';
	  import { ATTRACTION_STATUS_OPTIONS } from '$lib/labels/attractions';
	</script>

	<FilterSelect
	  options={ATTRACTION_STATUS_OPTIONS}
	  filterKey="status"
	  currentValue={filters.status}
	  placeholder="Estado"
	  onFilterChange={handleFilterChange}
	/>
	```
-->

<div class="flex gap-2">
	<select
		class="select {width}"
		value={selectedValue || ''}
		onchange={handleChange}
		class:!border-success={selectedValue !== undefined}
		class:text-success={selectedValue !== undefined}
	>
		<option value="" disabled>{placeholder}</option>

		{#each options as option (option.id)}
			<option value={option.id}>{option.name}</option>
		{/each}
	</select>

	<div class="tooltip" data-tip={clearTooltip}>
		<button
			class="btn btn-square btn-soft btn-md btn-error"
			onclick={handleClear}
			disabled={!selectedValue}
		>
			<Cancel />
		</button>
	</div>
</div>
