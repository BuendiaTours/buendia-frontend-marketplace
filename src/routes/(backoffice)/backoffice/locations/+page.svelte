<script lang="ts">
	// ============================================================================
	// IMPORTS
	// ============================================================================

	// Types
	import type { PageData } from './$types';
	import type { Location, Column } from '$lib/types';
	import type { LocationsFilters } from './schemas/filters.schema';

	// SvelteKit
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	// Utils
	import type { PatchValue } from '$lib/utils/filters';
	import { patchFilters } from '$lib/utils/filters';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { locationsFiltersSchema } from './schemas/filters.schema';

	// Enums
	import { LOCATION_KIND_OPTIONS } from '$lib/labels/locations';

	// Routes
	import { LOCATION_ROUTES } from '$lib/config/routes/backoffice/locations';

	// Components
	import Pagination from '$lib/components/backoffice/MeltPagination.svelte';
	import FilterSelect from '$lib/components/backoffice/filters/FilterSelect.svelte';
	import TableSortableHeader from '$lib/components/backoffice/tables/TableSortableHeader.svelte';
	import TableResetSort from '$lib/components/backoffice/tables/TableResetSort.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	// Icons
	import { Add, Magnifier } from '$lib/icons/Linear';

	// ============================================================================
	// PROPS & DATA
	// ============================================================================

	let { data }: { data: PageData } = $props();

	const items = $derived(data.items);
	const pagination = $derived(data.pagination);
	const filters = $derived(data.filters as LocationsFilters);
	const sort = $derived(data.sort);
	const pageSize = $derived(pagination?.pageSize ?? 10);
	const total = $derived(pagination?.total ?? 0);

	// ============================================================================
	// SEARCH STATE
	// ============================================================================

	let searchQuery = $derived.by(() => filters.q || '');

	// ============================================================================
	// FILTRO: KIND
	// ============================================================================

	function handleKindFilterChange(filterKey: string, value: string | null) {
		applyFilterPatch({
			[filterKey]: value
		} as { [K in keyof LocationsFilters]?: PatchValue<LocationsFilters[K]> });
	}

	// ============================================================================
	// FILTER FUNCTIONS
	// ============================================================================

	function applyFilterPatch(patch: {
		[K in keyof LocationsFilters]?: PatchValue<LocationsFilters[K]>;
	}) {
		const currentParams = page.url.searchParams;
		const newParams = patchFilters(locationsFiltersSchema, currentParams, patch);
		goto(`?${newParams.toString()}`, { keepFocus: true, noScroll: true });
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

	const columns: Column<Location>[] = [
		{ key: 'name', title: 'Nombre', sortable: true },
		{ key: 'kind', title: 'Tipo', sortable: true }
	];

	function handlePageChange(newPage: number) {
		applyFilterPatch({ page: newPage });
	}

	// ============================================================================
	// COMPUTED
	// ============================================================================
</script>

<svelte:head>
	<title>Ubicaciones - Backoffice</title>
</svelte:head>

<LocationBar title="Listado de ubicaciones" breadcrumbs={data.breadcrumbs} />

<!-- Filters Bar -->
<div class="bnd-filter-bar card flex-row items-center gap-6 p-2">
	<!-- Search Box -->
	<div class="flex w-full items-center gap-2">
		<input
			type="text"
			placeholder="Buscar ubicaciones..."
			class="input-bordered input w-full"
			bind:value={searchQuery}
			onkeydown={(e) => e.key === 'Enter' && handleSearch()}
		/>
		<button class="btn btn-square btn-outline btn-primary" onclick={handleSearch}>
			<Magnifier class="size-5" />
		</button>
	</div>

	<FilterSelect
		options={LOCATION_KIND_OPTIONS}
		filterKey="kind"
		currentValue={filters.kind}
		placeholder="Selecciona tipo"
		clearTooltip="Limpia el tipo"
		onFilterChange={handleKindFilterChange}
	/>

	<a href={LOCATION_ROUTES.create} class="btn btn-outline btn-primary ml-auto">
		<Add class="size-5" />
		Nueva ubicación
	</a>
</div>

<!-- Table -->
<div class="card mt-6">
	<table class="table-zebra table-sm table">
		<thead>
			<tr>
				{#each columns as col (col.key)}
					<th>
						{#if col.sortable}
							<TableSortableHeader
								title={col.title}
								field={col.key}
								currentSort={sort}
								onSortChange={(newSort) =>
									applyFilterPatch({
										sort: newSort.field as LocationsFilters['sort'],
										order: newSort.order
									})}
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
					<td colspan={columns.length + 1} class="text-center">
						<div class="py-8">
							<p class="text-base-content/50">No se encontraron elementos</p>
						</div>
					</td>
				</tr>
			{:else}
				{#each items as item (item.id)}
					<tr>
						{#each columns as col (col.key)}
							{#if col.key === 'name'}
								<td>
									<p>
										<a
											href={buildUrlWithFilters(
												LOCATION_ROUTES.detail(item.id),
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
										{LOCATION_KIND_OPTIONS.find((k) => k.id === item.kind)?.name || item.kind}
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
												LOCATION_ROUTES.detail(item.id),
												page.url.searchParams
											)}
										>
											Ver
										</a>
									</li>
									<li>
										<a
											href={buildUrlWithFilters(
												LOCATION_ROUTES.edit(item.id),
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
		<Pagination
			count={total}
			currentPage={pagination?.page ?? 1}
			perPage={pageSize}
			onPageChange={handlePageChange}
		/>
	</div>
{/if}
