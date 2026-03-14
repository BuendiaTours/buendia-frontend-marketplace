<script lang="ts">
	/**
	 * Locations list page.
	 * Displays a filterable, sortable, paginated table of locations.
	 */
	import type { PageProps } from './$types';
	import type { LocationsFilters } from './schemas/filters.schema';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import type { PatchValue } from '$lib/utils/filters';
	import { patchFilters } from '$lib/utils/filters';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { locationsFiltersSchema } from './schemas/filters.schema';
	import { LOCATION_KIND_OPTIONS } from '$lib/labels/locations';
	import { LOCATION_ROUTES } from '$lib/config/routes/backoffice/locations';

	import Pagination from '$lib/components/backoffice/MeltPagination.svelte';
	import FilterSelect from '$lib/components/backoffice/filters/FilterSelect.svelte';
	import TableSortableHeader from '$lib/components/backoffice/tables/TableSortableHeader.svelte';
	import TableResetSort from '$lib/components/backoffice/tables/TableResetSort.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';
	import { Add, Magnifier } from '$lib/icons/Linear';

	/** Page data from server load function. */
	let { data }: PageProps = $props();

	const items = $derived(data.items);
	const pagination = $derived(data.pagination);
	const filters = $derived(data.filters as LocationsFilters);
	const sort = $derived(data.sort);
	const pageSize = $derived(pagination?.pageSize ?? 10);
	const total = $derived(pagination?.total ?? 0);

	/** Local search input state, synced from URL filters. */
	let searchQuery = $derived(filters.q || '');

	/** Applies a partial filter update to the URL search params. */
	function applyFilterPatch(patch: {
		[K in keyof LocationsFilters]?: PatchValue<LocationsFilters[K]>;
	}) {
		const currentParams = page.url.searchParams;
		const newParams = patchFilters(locationsFiltersSchema, currentParams, patch);
		goto(`?${newParams.toString()}`, { keepFocus: true, noScroll: true });
	}

	function handleKindFilterChange(filterKey: string, value: string | null) {
		applyFilterPatch({
			[filterKey]: value
		} as { [K in keyof LocationsFilters]?: PatchValue<LocationsFilters[K]> });
	}

	function handleSearch() {
		applyFilterPatch({ q: searchQuery || null });
	}

	function handlePageChange(newPage: number) {
		applyFilterPatch({ page: newPage });
	}
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
				<th>
					<TableSortableHeader
						title="Nombre"
						field="name"
						currentSort={sort}
						onSortChange={(newSort) =>
							applyFilterPatch({
								sort: newSort.field as LocationsFilters['sort'],
								order: newSort.order
							})}
					/>
				</th>
				<th>
					<TableSortableHeader
						title="Tipo"
						field="kind"
						currentSort={sort}
						onSortChange={(newSort) =>
							applyFilterPatch({
								sort: newSort.field as LocationsFilters['sort'],
								order: newSort.order
							})}
					/>
				</th>
				<th class="w-0">
					<TableResetSort currentSort={sort} />
				</th>
			</tr>
		</thead>
		<tbody>
			{#if items.length === 0}
				<tr>
					<td colspan="3" class="text-center">
						<div class="py-8">
							<p class="text-base-content/50">No se encontraron elementos</p>
						</div>
					</td>
				</tr>
			{:else}
				{#each items as item (item.id)}
					<tr>
						<td>
							<p>
								<a href={buildUrlWithFilters(LOCATION_ROUTES.edit(item.id), page.url.searchParams)}>
									{item.name}
								</a>
							</p>
							<p class="text-base-content/50 text-xs">
								{item.descriptionShort}
							</p>
							{#if item.parent?.name}
								<p class="text-base-content/40 text-xs">
									Pertenece a "{item.parent.name}"
								</p>
							{/if}
						</td>
						<td>
							{LOCATION_KIND_OPTIONS.find((k) => k.id === item.kind)?.name || item.kind}
						</td>
						<td class="w-0 text-right">
							<div class="dropdown dropdown-end dropdown-bottom">
								<div tabindex="0" role="button" class="text-bold btn btn-sm m-1">⋮</div>
								<ul tabindex="-1" class="dropdown-content menu">
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
