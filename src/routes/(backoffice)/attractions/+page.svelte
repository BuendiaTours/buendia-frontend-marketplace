<script lang="ts">
	// ============================================================================
	// IMPORTS
	// ============================================================================

	// Types
	import type { Attraction, Column } from '$lib/types';
	import type { AttractionsFilters } from './filters.schema';

	// SvelteKit
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	// Utils
	import { patchFilters, clearAllFilters, resetSort, hasActiveFilters } from '$lib/utils/filters';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { attractionsFiltersSchema } from './filters.schema';

	// i18n
	import * as m from '$paraglide/messages';

	// Actions
	import { checkAll } from '$lib/actions/checkAll';

	// Components
	import Pagination from '$lib/components/MeltPagination.svelte';
	import FilterAdvancedDialog from '$lib/components/filters/FilterAdvancedDialog.svelte';
	import FilterSelectRemote from '$lib/components/filters/FilterSelectRemote.svelte';
	import PagecountAboveTable from '$lib/layout/partials/PagecountAboveTable.svelte';

	// Icons
	import {
		ArrowSeparateVertical,
		Cancel,
		Check,
		NavArrowDown,
		NavArrowUp,
		Plus,
		Search
	} from 'svelte-iconoir';

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

	let searchQuery = $state('');

	$effect(() => {
		searchQuery = filters.q || '';
	});

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
		Object.fromEntries(advancedFiltersConfig.map((f) => [f.key, (filters as any)[f.key] ?? false]))
	);

	// ============================================================================
	// FILTER FUNCTIONS
	// ============================================================================

	function applyFilterPatch(patch: Record<string, any>) {
		const currentParams = $page.url.searchParams;
		const newParams = patchFilters(attractionsFiltersSchema, currentParams, patch);
		goto(`?${newParams.toString()}`, { keepFocus: true, noScroll: true });
	}

	function handleClearFilters() {
		clearAllFilters($page.url.pathname, $page.url.searchParams, goto);
		searchQuery = '';
	}

	function handleAdvancedFiltersApply(appliedFilters: Record<string, boolean>) {
		const patch: Record<string, any> = {};
		advancedFiltersConfig.forEach((filter) => {
			patch[filter.key] = appliedFilters[filter.key] || (null as any);
		});
		applyFilterPatch(patch);
	}

	function handleClearAdvancedFilters() {
		const patch: Record<string, any> = {};
		advancedFiltersConfig.forEach((filter) => {
			patch[filter.key] = null as any;
		});
		applyFilterPatch(patch);
	}

	function handleSearch() {
		applyFilterPatch({ q: searchQuery || null, page: 1 });
	}

	// ============================================================================
	// FILTRO: STATUS
	// ============================================================================

	function handleStatusFilterChange(filterKey: string, value: string | null) {
		applyFilterPatch({
			[filterKey]: value === null ? (null as any) : value,
			page: 1
		});
	}

	// ============================================================================
	// SORTING
	// ============================================================================

	function handleSort(field: string) {
		const currentOrder = sort?.field === field ? sort.order : null;
		const newOrder = currentOrder === 'asc' ? 'desc' : currentOrder === 'desc' ? null : 'asc';

		applyFilterPatch({
			sort: newOrder ? field : null,
			order: newOrder,
			page: 1
		});
	}

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

	function handleResetSort() {
		resetSort($page.url.pathname, $page.url.searchParams, goto);
	}

	// ============================================================================
	// COMPUTED
	// ============================================================================

	const hasFilters = $derived(hasActiveFilters(filters));
</script>

<svelte:head>
	<title>Atracciones - Backoffice</title>
</svelte:head>

<h1 class="text-lg">Atracciones</h1>

<!-- Filters Bar -->
<div
	class="bnd-filter-bar mt-6 flex items-center gap-8 rounded-box border border-base-content/9 bg-base-100 p-2"
>
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

	<FilterSelectRemote
		apiEndpoint="http://localhost:3333/attraction-status"
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

	<a href="/attractions/new" class="btn btn-outline btn-primary">
		<Plus />
		Nueva atracción
	</a>
</div>

<!-- Table -->
<div class="mt-6 rounded-box border border-base-content/9 bg-base-100">
	<table class="table table-zebra table-sm">
		<thead>
			<tr>
				<th class="w-12">
					<input type="checkbox" class="checkbox checkbox-sm" use:checkAll />
				</th>
				{#each columns as col}
					<th>
						{#if col.sortable}
							<button
								type="button"
								class="btn cursor-pointer pr-2 btn-ghost btn-sm"
								onclick={() => handleSort(col.key)}
							>
								<span class:text-success={sort?.field === col.key}>{col.title}</span>

								{#if sort?.field === col.key}
									{#if sort.order === 'desc'}
										<NavArrowDown class="text-success" />
									{:else}
										<NavArrowUp class="text-success" />
									{/if}
								{:else}
									<ArrowSeparateVertical class="text-base-content/30" />
								{/if}
							</button>
						{:else}
							<span>{col.title}</span>
						{/if}
					</th>
				{/each}
				<th class="w-0">
					{#if sort}
						<button class="btn btn-soft btn-sm btn-error" onclick={handleResetSort}
							>Reset sort</button
						>
					{/if}
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
				{#each items as item}
					<tr>
						<td>
							<input
								type="checkbox"
								name="attractions_selected[]"
								value={item.id}
								class="checkbox checkbox-sm"
							/>
						</td>
						{#each columns as col}
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
												`/attractions/${item.slug}`,
												$page.url.searchParams
											)}
										>
											{item[col.key]}
										</a>
									</p>
									<p class="text-xs text-base-content/50">
										{item['description']}
									</p>
								</td>
							{:else if col.key === 'status'}
								<td>
									<span>
										{item.status === 'ACTIVE'
											? 'Activo'
											: item.status === 'DRAFT'
												? 'Borrador'
												: 'Inactivo'}
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
								<div tabindex="0" role="button" class="text-bold btn m-1 btn-sm">⋮</div>
								<ul
									tabindex="-1"
									class="dropdown-content menu z-1 w-52 rounded-box bg-base-100 p-2 shadow-sm"
								>
									<li>
										<a
											href={buildUrlWithFilters(
												`/attractions/${item.slug}`,
												$page.url.searchParams
											)}
										>
											Ver
										</a>
									</li>
									<li>
										<a
											href={buildUrlWithFilters(
												`/attractions/${item.slug}/edit`,
												$page.url.searchParams
											)}>Editar</a
										>
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
