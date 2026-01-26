<script lang="ts">
	// ============================================================================
	// IMPORTS
	// ============================================================================

	// Types
	import type { Destination, Column } from '$lib/types';
	import type { DestinationsFilters } from './filters.schema';

	// SvelteKit
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	// Utils
	import { patchFilters, clearFilters, hasActiveFilters } from '$lib/utils/filters';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { destinationsFiltersSchema } from './filters.schema';

	// i18n
	import * as m from '$paraglide/messages';

	// Actions
	import { checkAll } from '$lib/actions/checkAll';

	// Components
	import Pagination from '$lib/components/MeltPagination.svelte';
	import FilterAdvancedDialog from '$lib/components/filters/FilterAdvancedDialog.svelte';

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
			items: Destination[];
			pagination: {
				page: number;
				pageSize: number;
				total: number;
				totalPages: number;
			};
			filters: DestinationsFilters;
			sort: { field: string; order: 'asc' | 'desc' } | null;
		};
	} = $props();

	const items = $derived(data.items);
	const pagination = $derived(data.pagination);
	const filters = $derived(data.filters);
	const sort = $derived(data.sort);
	const pageSize = $derived(pagination.pageSize);
	const total = $derived(pagination.total);

	// ============================================================================
	// TABLE CONFIGURATION
	// ============================================================================

	const columns: Column<Destination>[] = [
		{ key: 'id', title: 'Id', sortable: true },
		{ key: 'name', title: 'Nombre', sortable: true },
		{ key: 'slug', title: 'Slug', sortable: true },
		{ key: 'kind', title: 'Tipo', sortable: true }
	];

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
		const newFilters = patchFilters(destinationsFiltersSchema, filters, patch);
		goto(`?${newFilters.toString()}`, { keepFocus: true, noScroll: true });
	}

	function handleClearFilters() {
		const clearedParams = clearFilters($page.url.searchParams);
		goto(`?${clearedParams.toString()}`, { keepFocus: true, noScroll: true });
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

	function getSortIcon(field: string) {
		if (sort?.field !== field) return ArrowSeparateVertical;
		return sort.order === 'asc' ? NavArrowUp : NavArrowDown;
	}

	// ============================================================================
	// PAGINATION
	// ============================================================================

	function handlePageChange(newPage: number) {
		applyFilterPatch({ page: newPage });
	}

	function handlePageSizeChange(newPageSize: number) {
		applyFilterPatch({ pageSize: newPageSize, page: 1 });
	}

	// ============================================================================
	// COMPUTED
	// ============================================================================

	const hasFilters = $derived(hasActiveFilters($page.url.searchParams));
</script>

<svelte:head>
	<title>Destinos - Backoffice</title>
</svelte:head>

<h1 class="text-lg">Destinos</h1>

<!-- Filters Bar -->
<div class="mb-6 flex flex-wrap gap-2">
	<!-- Search Box -->
	<div class="join flex-1">
		<input
			type="text"
			placeholder="Buscar destinos..."
			class="input-bordered input join-item w-full"
			bind:value={searchQuery}
			onkeydown={(e) => e.key === 'Enter' && handleSearch()}
		/>
		<button class="btn join-item btn-primary" onclick={handleSearch}>
			<Search />
		</button>
	</div>

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

<!-- Results Info -->
<div class="mt-6 flex items-center justify-between">
	{#if items.length}
		<div class="pagenav-info text-sm text-base-content/70">
			Página {pagination.page} de {pagination.totalPages}, mostrando los elementos del {(pagination.page -
				1) *
				pagination.pageSize +
				1} al {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total}
		</div>
	{/if}

	<a href="/destinations/new" class="btn btn-outline btn-primary">
		<Plus />
		Nuevo destino
	</a>
</div>

<!-- Table -->
<div class="overflow-x-auto">
	<table class="table">
		<thead>
			<tr>
				<th class="w-12">
					<input type="checkbox" class="checkbox" use:checkAll={'input[name="selected"]'} />
				</th>
				{#each columns as column}
					<th>
						{column.title || String(column.key)}
					</th>
				{/each}
				<th class="w-32">Acciones</th>
			</tr>
		</thead>
		<tbody>
			{#if items.length === 0}
				<tr>
					<td colspan={columns.length + 2} class="text-center">
						<div class="py-8">
							<p class="text-base-content/50">No se encontraron destinos</p>
						</div>
					</td>
				</tr>
			{:else}
				{#each items as item}
					<tr class="hover">
						<td>
							<input type="checkbox" name="selected" value={item.id} class="checkbox" />
						</td>
						<td>
							<a href="/destinations/{item.slug}" class="link">{item.name}</a>
						</td>
						<td>{item.slug}</td>
						<td>
							<span class="badge badge-sm">
								{item.kind === 'CITY' ? 'Ciudad' : item.kind === 'REGION' ? 'Región' : 'País'}
							</span>
						</td>
						<td class="max-w-md truncate">{item.descriptionShort}</td>
						<td>
							<div class="flex gap-2">
								<a href="/destinations/{item.slug}" class="btn btn-ghost btn-sm">Ver</a>
								<a href="/destinations/{item.slug}/edit" class="btn btn-ghost btn-sm">Editar</a>
							</div>
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

<!-- Pagination -->
{#if total > 0}
	<div class="mt-4">
		<Pagination count={total} perPage={pageSize} onPageChange={handlePageChange} />
	</div>
{/if}
