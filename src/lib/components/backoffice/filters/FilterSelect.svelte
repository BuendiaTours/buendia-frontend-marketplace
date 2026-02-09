<script lang="ts">
	import { Cancel } from 'svelte-iconoir';
	import type { RemoteQueryFunction } from '@sveltejs/kit';

	type Option = {
		id: string;
		name: string;
		[key: string]: any;
	};

	/**
	 * Union type para las diferentes formas de proporcionar opciones:
	 * - 'static': Array de opciones proporcionado directamente
	 * - 'remote': Remote Function de SvelteKit (recomendado para datos del servidor)
	 * - 'endpoint': Fetch manual a un endpoint (legacy, para migración gradual)
	 */
	type OptionsSource =
		| { type: 'static'; options: Option[] }
		| { type: 'remote'; queryFunction: RemoteQueryFunction<void, Option[]> }
		| { type: 'endpoint'; apiEndpoint: string };

	let {
		source,
		filterKey,
		currentValue = undefined,
		placeholder = 'Selecciona una opción',
		clearTooltip = 'Limpiar filtro',
		width = 'w-44',
		onFilterChange
	}: {
		source: OptionsSource;
		filterKey: string;
		currentValue?: string | undefined;
		placeholder?: string;
		clearTooltip?: string;
		width?: string;
		onFilterChange: (filterKey: string, value: string | null) => void;
	} = $props();

	let selectedValue = $state<string | undefined>(undefined);
	let options = $state<Option[]>([]); // Solo para 'static' y 'endpoint'

	// Sincronizar con el valor externo cuando cambie
	$effect(() => {
		selectedValue = currentValue;
	});

	// Cargar opciones para 'endpoint' (legacy)
	$effect(() => {
		if (source.type === 'endpoint') {
			const loadOptions = async () => {
				try {
					const response = await fetch(source.apiEndpoint);
					if (response.ok) {
						options = await response.json();
					}
				} catch (error) {
					console.error(`Error cargando datos desde ${source.apiEndpoint}:`, error);
				}
			};
			loadOptions();
		}
	});

	// Cargar opciones para 'static'
	$effect(() => {
		if (source.type === 'static') {
			options = source.options;
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

<!--
	FilterSelect - Componente unificado de selector de filtros
	
	Este componente maneja tres tipos de fuentes de datos:
	
	1. REMOTE FUNCTIONS (Recomendado) - Para datos del servidor con type-safety
	2. OPCIONES ESTÁTICAS - Para arrays locales/constantes
	3. ENDPOINT (Legacy) - Para migración gradual de código existente
	
	═══════════════════════════════════════════════════════════════════
	
	EJEMPLO 1: Remote Functions (⭐ Recomendado)
	────────────────────────────────────────────────────────────────────
	Usa Remote Functions de SvelteKit para cargar datos del servidor.
	Ventajas: Type-safe, menos código, mejor DX.
	
	```svelte
	<script>
	  import FilterSelect from '$lib/components/filters/FilterSelect.svelte';
	  import { getDestinationKinds } from '$lib/api/backoffice/common.remote';
	  
	  function handleFilterChange(key, value) {
	    console.log(`Filter ${key} changed to:`, value);
	  }
	</script>
	
	<FilterSelect
	  source={{ type: 'remote', queryFunction: getDestinationKinds }}
	  filterKey="kind"
	  currentValue={filters.kind}
	  placeholder="Tipo de destino"
	  {onFilterChange}
	/>
	```
	
	═══════════════════════════════════════════════════════════════════
	
	EJEMPLO 2: Opciones estáticas
	────────────────────────────────────────────────────────────────────
	Usa un array local cuando las opciones son fijas/conocidas.
	
	```svelte
	<script>
	  const statusOptions = [
	    { id: 'ACTIVE', name: 'Activo' },
	    { id: 'INACTIVE', name: 'Inactivo' },
	    { id: 'DRAFT', name: 'Borrador' }
	  ];
	</script>
	
	<FilterSelect
	  source={{ type: 'static', options: statusOptions }}
	  filterKey="status"
	  currentValue={filters.status}
	  placeholder="Estado"
	  {onFilterChange}
	/>
	```
	
	═══════════════════════════════════════════════════════════════════
	
	EJEMPLO 3: Endpoint (Legacy - Para migración gradual)
	────────────────────────────────────────────────────────────────────
	Fetch manual a un endpoint. Úsalo solo si aún no has migrado a Remote Functions.
	
	```svelte
	<FilterSelect
	  source={{ type: 'endpoint', apiEndpoint: '/api/destination-kind' }}
	  filterKey="kind"
	  currentValue={filters.kind}
	  {onFilterChange}
	/>
	```
	
	═══════════════════════════════════════════════════════════════════
	
	PROPS:
	──────
	@param source - Fuente de datos (ver union type arriba)
	@param filterKey - Identificador del filtro (ej: 'status', 'kind')
	@param currentValue - Valor actual seleccionado (sincronización externa)
	@param placeholder - Texto del placeholder (default: 'Selecciona una opción')
	@param clearTooltip - Tooltip del botón limpiar (default: 'Limpiar filtro')
	@param width - Clase de ancho Tailwind (default: 'w-44')
	@param onFilterChange - Callback (filterKey: string, value: string | null) => void
	
	═══════════════════════════════════════════════════════════════════
	
	FORMATO DE OPCIONES:
	────────────────────
	Todas las opciones deben seguir esta estructura mínima:
	
	```typescript
	type Option = {
	  id: string;      // Valor del option (value)
	  name: string;    // Texto visible del option
	  [key: string]: any;  // Campos adicionales opcionales
	};
	```
	
	═══════════════════════════════════════════════════════════════════
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

		{#if source.type === 'remote'}
			<!-- Remote Function: lazy loading con await -->
			{#each await source.queryFunction() as option}
				<option value={option.id}>{option.name}</option>
			{/each}
		{:else}
			<!-- Static o Endpoint: usar array local -->
			{#each options as option}
				<option value={option.id}>{option.name}</option>
			{/each}
		{/if}
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
