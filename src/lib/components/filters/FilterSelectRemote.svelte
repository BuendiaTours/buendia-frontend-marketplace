<script lang="ts">
	import { onMount } from 'svelte';
	import { Cancel } from 'svelte-iconoir';

	type Option = {
		id: string;
		name: string;
		[key: string]: any;
	};

	let {
		apiEndpoint,
		filterKey,
		currentValue = undefined,
		placeholder = 'Selecciona una opción',
		clearTooltip = 'Limpiar filtro',
		width = 'w-44',
		onFilterChange
	}: {
		apiEndpoint: string;
		filterKey: string;
		currentValue?: string | undefined;
		placeholder?: string;
		clearTooltip?: string;
		width?: string;
		onFilterChange: (filterKey: string, value: string | null) => void;
	} = $props();

	let options = $state<Option[]>([]);
	let selectedValue = $state<string | undefined>(undefined);

	// Sincronizar con el valor externo cuando cambie
	$effect(() => {
		selectedValue = currentValue;
	});

	// Cargar opciones desde la API
	onMount(async () => {
		try {
			const response = await fetch(apiEndpoint);
			if (response.ok) {
				const data: Option[] = await response.json();
				options = data;
			}
		} catch (error) {
			console.error(`Error cargando datos desde ${apiEndpoint}:`, error);
		}
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

<div class="flex gap-2">
	<select
		class="select {width}"
		value={selectedValue || ''}
		onchange={handleChange}
		class:border-success={selectedValue !== undefined}
		class:text-success={selectedValue !== undefined}
	>
		<option value="" disabled>{placeholder}</option>
		{#each options as option}
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
