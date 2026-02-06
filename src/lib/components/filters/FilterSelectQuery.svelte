<script lang="ts">
	import { Cancel } from 'svelte-iconoir';
	import type { RemoteQueryFunction } from '@sveltejs/kit';

	type Option = {
		id: string;
		name: string;
		[key: string]: any;
	};

	let {
		queryFunction,
		filterKey,
		currentValue = undefined,
		placeholder = 'Selecciona una opción',
		clearTooltip = 'Limpiar filtro',
		width = 'w-44',
		onFilterChange
	}: {
		queryFunction: RemoteQueryFunction<void, Option[]>;
		filterKey: string;
		currentValue?: string | undefined;
		placeholder?: string;
		clearTooltip?: string;
		width?: string;
		onFilterChange: (filterKey: string, value: string | null) => void;
	} = $props();

	let selectedValue = $state<string | undefined>(undefined);

	// Sincronizar con el valor externo cuando cambie
	$effect(() => {
		selectedValue = currentValue;
	});

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
	FilterSelectQuery - Selector de filtros con Remote Functions
	
	Este componente usa Remote Functions de SvelteKit para cargar opciones
	de forma declarativa y type-safe, sin necesidad de endpoints proxy.
	
	@param queryFunction - Remote query function que retorna las opciones
	@param filterKey - Clave del filtro para identificarlo
	@param currentValue - Valor actual seleccionado
	@param placeholder - Texto placeholder del select
	@param clearTooltip - Texto del tooltip del botón limpiar
	@param width - Clase de ancho (Tailwind)
	@param onFilterChange - Callback cuando cambia el valor
	
	@example
	```svelte
	<script>
	  import { getDestinationKinds } from '$lib/api/common.remote';
	  import FilterSelectQuery from '$lib/components/filters/FilterSelectQuery.svelte';
	  
	  function handleFilterChange(key, value) {
	    // Manejar cambio de filtro
	  }
	</script>
	
	<FilterSelectQuery
	  queryFunction={getDestinationKinds}
	  filterKey="kind"
	  currentValue={filters.kind}
	  placeholder="Tipo de destino"
	  {onFilterChange}
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
		{#each await queryFunction() as option}
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
