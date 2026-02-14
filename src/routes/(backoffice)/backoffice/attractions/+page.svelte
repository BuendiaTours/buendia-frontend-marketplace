<script lang="ts">
	// ============================================================================
	// IMPORTS
	// ============================================================================

	// Types
	import type { Attraction, Column } from '$lib/types';
	import type { AttractionsFilters } from './filters.schema';

	// SvelteKit
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	// Utils
	import type { PatchValue } from '$lib/utils/filters';
	import { patchFilters, clearAllFilters, resetSort, hasActiveFilters } from '$lib/utils/filters';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { attractionsFiltersSchema } from './filters.schema';

	// i18n
	import * as m from '$paraglide/messages';

	// Routes
	import { ATTRACTION_ROUTES } from '$api-attractions/routes';

	// Actions
	import { checkAll } from '$lib/actions/backoffice/checkAll';

	// Components
	import Pagination from '$lib/components/backoffice/MeltPagination.svelte';
	import FilterAdvancedDialog from '$lib/components/backoffice/filters/FilterAdvancedDialog.svelte';
	import FilterSelect from '$lib/components/backoffice/filters/FilterSelect.svelte';
	import { ATTRACTION_STATUS_OPTIONS } from '$api-attractions/enums';
	import PagecountAboveTable from '$lib/layout/backoffice/partials/PagecountAboveTable.svelte';
	import TableSortableHeader from '$lib/components/backoffice/tables/TableSortableHeader.svelte';
	import TableResetSort from '$lib/components/backoffice/tables/TableResetSort.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	// MeltDrawerManager - Gestiona drawers dinámicos con animaciones
	import MeltDrawerManager from '$lib/components/backoffice/MeltDrawerManager.svelte';
	import ErrorDisplay from '$lib/components/backoffice/ErrorDisplay.svelte';

	// Icons
	import { Cancel, Check, Plus, Search, WarningTriangle } from 'svelte-iconoir';

	// ============================================================================
	// PROPS & DATA
	// ============================================================================

	let {
		data
	}: {
		data: {
			items: Attraction[];
			pagination: {
				page: number;
				pageSize: number;
				total: number;
				totalPages: number;
			} | null;
			filters: AttractionsFilters;
			sort: { field: string; order: 'asc' | 'desc' } | null;
			breadcrumbs: Array<{ label: string; href?: string }>;
		};
	} = $props();

	const items = $derived(data.items);
	const pagination = $derived(data.pagination);
	const filters = $derived(data.filters);
	const sort = $derived(data.sort);
	const pageSize = $derived(pagination?.pageSize ?? 10);
	const total = $derived(pagination?.total ?? 0);

	// ============================================================================
	// DRAWER STATE & ASYNC DATA
	// ============================================================================

	let selectedAttractionId = $state<string | null>(null);
	let attractionData = $state<Record<string, unknown> | null>(null);
	let isLoadingData = $state(false);
	let dataError = $state<string | null>(null);

	// Cargar datos cuando se selecciona una atracción
	$effect(() => {
		if (selectedAttractionId) {
			// Encontrar el slug de la atracción seleccionada
			const selectedAttraction = items.find((item) => item.id === selectedAttractionId);
			if (!selectedAttraction) return;

			isLoadingData = true;
			dataError = null;
			attractionData = null;

			// Cargar datos desde la API local
			fetch(`http://localhost:3333/attractions/${selectedAttraction.slug}`)
				.then((response) => {
					if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
					return response.json();
				})
				.then((data) => {
					attractionData = data;
					isLoadingData = false;
				})
				.catch((error) => {
					dataError = error.message;
					isLoadingData = false;
				});
		}
	});

	// ============================================================================
	// SEARCH STATE
	// ============================================================================

	let searchQuery = $derived(filters.q || '');

	// ============================================================================
	// ADVANCED FILTERS STATE
	// ============================================================================

	const advancedFiltersConfig = [
		{ key: 'wheelchairAccessible', label: 'Accesible silla de ruedas' },
		{ key: 'breakfastIncluded', label: 'Desayuno incluido' },
		{ key: 'kidsFreeTour', label: 'Gratis para niños' }
	] as const;

	// Crear objeto con los valores actuales de los filtros avanzados
	const currentAdvancedFilters = $derived(
		Object.fromEntries(advancedFiltersConfig.map((f) => [f.key, filters[f.key] ?? false]))
	);

	// ============================================================================
	// FILTER FUNCTIONS
	// ============================================================================

	function applyFilterPatch(patch: {
		[K in keyof AttractionsFilters]?: PatchValue<AttractionsFilters[K]>;
	}) {
		const currentParams = page.url.searchParams;
		const newParams = patchFilters(attractionsFiltersSchema, currentParams, patch);
		goto(`?${newParams.toString()}`, { keepFocus: true, noScroll: true });
	}

	function handleClearFilters() {
		clearAllFilters(page.url.pathname, page.url.searchParams, goto);
		searchQuery = '';
	}

	function handleAdvancedFiltersApply(appliedFilters: Record<string, boolean>) {
		const patch: { [K in keyof AttractionsFilters]?: PatchValue<AttractionsFilters[K]> } = {};
		advancedFiltersConfig.forEach((filter) => {
			patch[filter.key] = appliedFilters[filter.key] || null;
		});
		applyFilterPatch(patch);
	}

	function handleClearAdvancedFilters() {
		const patch: { [K in keyof AttractionsFilters]?: PatchValue<AttractionsFilters[K]> } = {};
		advancedFiltersConfig.forEach((filter) => {
			patch[filter.key] = null;
		});
		applyFilterPatch(patch);
	}

	function handleSearch() {
		applyFilterPatch({ q: searchQuery || null });
	}

	// ============================================================================
	// FILTRO: STATUS
	// ============================================================================

	function handleStatusFilterChange(filterKey: string, value: string | null) {
		applyFilterPatch({
			[filterKey]: value
		} as { [K in keyof AttractionsFilters]?: PatchValue<AttractionsFilters[K]> });
	}

	// ============================================================================
	// SORTING
	// ============================================================================
	// Sort logic is now handled inside TableSortableHeader component
	// Reset sort logic is now handled inside TableResetSort component

	// ============================================================================
	// TABLA Y PAGINACIÓN
	// ============================================================================

	const columns: Column<Attraction>[] = [
		{ key: 'id', title: 'Id', sortable: false },
		{ key: 'name', title: 'Nombre', sortable: true },
		{ key: 'status', title: 'Estado', sortable: false }
	];

	function handlePageChange(newPage: number) {
		applyFilterPatch({ page: newPage });
	}

	// ============================================================================
	// COMPUTED
	// ============================================================================

	const hasFilters = $derived(hasActiveFilters(filters));
</script>

<svelte:head>
	<title>Atracciones - Backoffice</title>
</svelte:head>

<LocationBar title="Listado de atracciones" breadcrumbs={data.breadcrumbs} />

<!-- Filters Bar -->
<div class="bnd-filter-bar card flex-row items-center gap-6 p-2">
	<!-- Search Box -->
	<div class="flex w-full items-center gap-2">
		<input
			type="text"
			placeholder="Buscar atracciones..."
			class="input-bordered input w-full"
			bind:value={searchQuery}
			onkeydown={(e) => e.key === 'Enter' && handleSearch()}
		/>
		<button class="btn btn-square btn-outline btn-primary" onclick={handleSearch}>
			<Search />
		</button>
	</div>

	<FilterSelect
		options={ATTRACTION_STATUS_OPTIONS}
		filterKey="status"
		currentValue={filters.status}
		placeholder="Selecciona estado"
		clearTooltip="Limpia el estado"
		onFilterChange={handleStatusFilterChange}
	/>

	<div class="ml-auto flex items-center gap-2">
		<!-- Advanced Filters -->
		<FilterAdvancedDialog
			filters={advancedFiltersConfig}
			currentFilters={currentAdvancedFilters}
			onApply={handleAdvancedFiltersApply}
			onClear={handleClearAdvancedFilters}
		/>

		<!-- Clear Filters -->
		<div class="tooltip" data-tip="Limpiar todos los filtros">
			<button
				class="btn btn-square btn-soft btn-error"
				onclick={handleClearFilters}
				disabled={!hasFilters}
			>
				<Cancel />
			</button>
		</div>
	</div>
</div>

<!-- Results Info -->
<div class="mt-6 flex items-center justify-between">
	<PagecountAboveTable itemsLength={items.length} {pagination} />

	<a href={ATTRACTION_ROUTES.create} class="btn btn-outline btn-primary">
		<Plus />
		Nueva atracción
	</a>
</div>

<!-- Table -->
<div class="card mt-6">
	<table class="table-zebra table-sm table">
		<thead>
			<tr>
				<th class="w-12">
					<input type="checkbox" class="checkbox checkbox-sm" use:checkAll />
				</th>
				{#each columns as col (col.key)}
					<th>
						{#if col.sortable}
							<TableSortableHeader
								title={col.title}
								field={col.key}
								currentSort={sort}
								onSortChange={(newSort) =>
									applyFilterPatch({ sort: newSort.field, order: newSort.order })}
							/>
						{:else}
							<span>{col.title}</span>
						{/if}
					</th>
				{/each}
				<th class="w-0">
					<TableResetSort currentSort={sort} />
				</th>
			</tr>
		</thead>
		<tbody>
			{#if items.length === 0}
				<tr>
					<td colspan={columns.length + 2} class="text-center">
						<div class="py-8">
							<p class="text-base-content/50">No se encontraron elementos</p>
						</div>
					</td>
				</tr>
			{:else}
				{#each items as item (item.id)}
					<tr>
						<td>
							<input
								type="checkbox"
								name="attractions_selected[]"
								value={item.id}
								class="checkbox checkbox-sm"
							/>
						</td>
						{#each columns as col (col.key)}
							{#if col.key === 'id'}
								<td>
									<div class="tooltip" data-tip={item.id}>
										<span class="block max-w-[48px] truncate">{item.id}</span>
									</div>
								</td>
							{:else if col.key === 'status'}
								<td>
									{#if item.status === 'ACTIVE'}
										<div aria-label="success" class="status status-lg status-success mr-1"></div>
										<span>Activo</span>
									{:else if item.status === 'DRAFT'}
										<div aria-label="status" class="status status-lg status-neutral mr-1"></div>
										<span>Borrador</span>
									{:else}
										<div aria-label="error" class="status status-lg status-error mr-1"></div>
										<span>Inactivo</span>
									{/if}
								</td>
							{:else}
								<td>
									{item[col.key]}
								</td>
							{/if}
						{/each}
						<td class="w-0 text-right">
							<div class="dropdown dropdown-end dropdown-bottom">
								<div tabindex="0" role="button" class="text-bold btn btn-sm m-1">⋮</div>
								<ul tabindex="-1" class="dropdown-content menu">
									<li>
										<a
											href={buildUrlWithFilters(
												ATTRACTION_ROUTES.detail(item.slug),
												page.url.searchParams
											)}
										>
											Ver
										</a>
									</li>
									<li>
										<button
											class=""
											onclick={() => {
												selectedAttractionId = item.id;
											}}
										>
											Ver detalles
										</button>
									</li>
									<li>
										<a
											href={buildUrlWithFilters(
												ATTRACTION_ROUTES.edit(item.slug),
												page.url.searchParams
											)}
										>
											Editar
										</a>
									</li>
								</ul>
							</div></td
						>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

<!-- Pagination -->
{#if data.pagination}
	<div class="mt-4">
		<Pagination count={total} perPage={pageSize} onPageChange={handlePageChange} />
	</div>
{/if}

<!-- Drawer con datos asíncronos -->
<MeltDrawerManager
	bind:selectedId={selectedAttractionId}
	{items}
	title={(item) => `Detalles de ${item.title}`}
	config={{ side: 'right', width: 500 }}
>
	{#snippet content(item)}
		<div class="space-y-4">
			<!-- Información de la atracción -->
			<div class="bg-base-200 rounded-lg p-4">
				<h3 class="mb-2 font-semibold">{item.title}</h3>
				<p class="text-sm opacity-80">ID: {item.id}</p>
				<p class="text-sm opacity-80">Slug: {item.slug}</p>
			</div>

			{#if isLoadingData}
				<!-- Estado de carga -->
				<div class="flex flex-col items-center justify-center py-8">
					<span class="loading loading-spinner loading-lg text-primary"></span>
					<p class="mt-4 text-sm opacity-70">Cargando datos...</p>
				</div>
			{:else if dataError}
				<!-- Estado de error -->
				<ErrorDisplay
					title="Error al cargar datos"
					message={dataError}
					showTechnicalDetails={false}
				/>
			{:else if attractionData}
				<!-- Datos cargados - Mostrar JSON -->
				<div class="bg-base-200 rounded-lg p-4">
					<h4 class="mb-3 font-semibold">Respuesta de la API</h4>
					<div class="mockup-code">
						<pre class="px-4"><code>{JSON.stringify(attractionData, null, 2)}</code></pre>
					</div>
				</div>

				<div class="alert alert-info">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						class="h-6 w-6 shrink-0 stroke-current"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						></path>
					</svg>
					<span class="text-sm">
						Datos cargados desde: <code class="text-xs"
							>http://localhost:3333/attractions/{item.slug}</code
						>
					</span>
				</div>
			{/if}
		</div>
	{/snippet}
</MeltDrawerManager>
