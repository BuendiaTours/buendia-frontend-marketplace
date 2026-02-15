<script lang="ts">
	// ============================================================================
	// IMPORTS
	// ============================================================================

	// Types
	import type { Destination, Column } from '$lib/types';
	import type { CriteriaSortOption } from '$core/_shared/enums';
	import type { DestinationsFilters } from './schemas/filters.schema';

	// SvelteKit
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	// Utils
	import type { PatchValue } from '$lib/utils/filters';
	import { patchFilters, clearAllFilters, hasActiveFilters } from '$lib/utils/filters';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { destinationsFiltersSchema } from './schemas/filters.schema';

	// Enums
	import { DESTINATION_KIND_OPTIONS } from '$lib/labels/destinations';

	// Routes
	import { DESTINATION_ROUTES } from '$lib/config/routes/backoffice/destinations';

	// Actions
	import { checkAll } from '$lib/actions/backoffice/checkAll';

	// Components
	import Pagination from '$lib/components/backoffice/MeltPagination.svelte';
	import FilterAdvancedDialog from '$lib/components/backoffice/filters/FilterAdvancedDialog.svelte';
	import FilterSelect from '$lib/components/backoffice/filters/FilterSelect.svelte';
	import PagecountAboveTable from '$lib/layout/backoffice/partials/PagecountAboveTable.svelte';
	import TableSortableHeader from '$lib/components/backoffice/tables/TableSortableHeader.svelte';
	import TableResetSort from '$lib/components/backoffice/tables/TableResetSort.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	// Icons
	import { Cancel, Plus, Search } from 'svelte-iconoir';

	// ============================================================================
	// PROPS & DATA
	// ============================================================================

	let {
		data
	}: {
		data: {
			items: Destination[];
			pagination: {
				page: number;
				pageSize: number;
				total: number;
				totalPages: number;
			} | null;
			filters: DestinationsFilters;
			sort: { field: string; order: CriteriaSortOption } | null;
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
	// SEARCH STATE
	// ============================================================================

	let searchQuery = $derived(filters.q || '');

	// ============================================================================
	// FILTRO: KIND
	// ============================================================================

	function handleKindFilterChange(filterKey: string, value: string | null) {
		applyFilterPatch({
			[filterKey]: value
		} as { [K in keyof DestinationsFilters]?: PatchValue<DestinationsFilters[K]> });
	}

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
		[K in keyof DestinationsFilters]?: PatchValue<DestinationsFilters[K]>;
	}) {
		const currentParams = page.url.searchParams;
		const newParams = patchFilters(destinationsFiltersSchema, currentParams, patch);
		goto(`?${newParams.toString()}`, { keepFocus: true, noScroll: true });
	}

	function handleClearFilters() {
		clearAllFilters(page.url.pathname, page.url.searchParams, goto);
		searchQuery = '';
	}

	function handleAdvancedFiltersApply(appliedFilters: Record<string, boolean>) {
		const patch: { [K in keyof DestinationsFilters]?: PatchValue<DestinationsFilters[K]> } = {};
		advancedFiltersConfig.forEach((filter) => {
			patch[filter.key] = appliedFilters[filter.key] || null;
		});
		applyFilterPatch(patch);
	}

	function handleClearAdvancedFilters() {
		const patch: { [K in keyof DestinationsFilters]?: PatchValue<DestinationsFilters[K]> } = {};
		advancedFiltersConfig.forEach((filter) => {
			patch[filter.key] = null;
		});
		applyFilterPatch(patch);
	}

	function handleSearch() {
		applyFilterPatch({ q: searchQuery || null });
	}

	// ============================================================================
	// SORTING
	// ============================================================================
	// Sort logic is now handled inside TableSortableHeader component
	// Reset sort logic is now handled inside TableResetSort component

	// ============================================================================
	// TABLA Y PAGINACIÓN
	// ============================================================================

	const columns: Column<Destination>[] = [
		{ key: 'id', title: 'Id', sortable: false },
		{ key: 'name', title: 'Nombre', sortable: true },
		{ key: 'kind', title: 'Tipo', sortable: true }
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
	<title>Destinos - Backoffice</title>
</svelte:head>

<LocationBar title="Listado de destinos" breadcrumbs={data.breadcrumbs} />

<!-- Filters Bar -->
<div class="bnd-filter-bar card flex-row items-center gap-6 p-2">
	<!-- Search Box -->
	<div class="flex w-full items-center gap-2">
		<input
			type="text"
			placeholder="Buscar destinos..."
			class="input-bordered input w-full"
			bind:value={searchQuery}
			onkeydown={(e) => e.key === 'Enter' && handleSearch()}
		/>
		<button class="btn btn-square btn-outline btn-primary" onclick={handleSearch}>
			<Search />
		</button>
	</div>

	<FilterSelect
		options={DESTINATION_KIND_OPTIONS}
		filterKey="kind"
		currentValue={filters.kind}
		placeholder="Selecciona tipo"
		clearTooltip="Limpia el tipo"
		onFilterChange={handleKindFilterChange}
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

	<a href={DESTINATION_ROUTES.create} class="btn btn-outline btn-primary">
		<Plus />
		Nuevo destino
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
								name="destinations_selected[]"
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
							{:else if col.key === 'name'}
								<td>
									<p>
										<a
											href={buildUrlWithFilters(
												DESTINATION_ROUTES.detail(item.slug),
												page.url.searchParams
											)}
										>
											{item[col.key]}
										</a>
									</p>
									<p class="text-base-content/50 text-xs">
										{item['descriptionShort']}
									</p>
								</td>
							{:else if col.key === 'kind'}
								<td>
									<span>
										{DESTINATION_KIND_OPTIONS.find((k) => k.id === item.kind)?.name || item.kind}
									</span>
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
												DESTINATION_ROUTES.detail(item.slug),
												page.url.searchParams
											)}
										>
											Ver
										</a>
									</li>
									<li>
										<a
											href={buildUrlWithFilters(
												DESTINATION_ROUTES.edit(item.slug),
												page.url.searchParams
											)}>Editar</a
										>
									</li>
								</ul>
							</div>
						</td>
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
