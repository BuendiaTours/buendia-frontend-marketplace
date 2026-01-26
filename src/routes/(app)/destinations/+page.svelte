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
	import { createDialog, createPopover, melt } from '@melt-ui/svelte';
	import { fade, scale } from 'svelte/transition';

	// Icons
	import {
		ArrowSeparateVertical,
		Cancel,
		Check,
		FilterAlt,
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

	let searchQuery = $state(filters.q || '');

	// ============================================================================
	// ADVANCED FILTERS STATE
	// ============================================================================

	let advancedFilters = $state<Record<string, boolean>>({
		wheelchairAccessible: filters.wheelchairAccessible || false,
		breakfastIncluded: filters.breakfastIncluded || false,
		kidsFreeTour: filters.kidsFreeTour || false
	});

	const advancedFiltersConfig = [
		{ key: 'wheelchairAccessible', label: 'Accesible silla de ruedas' },
		{ key: 'breakfastIncluded', label: 'Desayuno incluido' },
		{ key: 'kidsFreeTour', label: 'Gratis para niños' }
	];

	// ============================================================================
	// DIALOG & POPOVER
	// ============================================================================

	const {
		elements: { trigger: advancedFiltersTrigger, overlay, content, title, close, portalled },
		states: { open }
	} = createDialog({
		forceVisible: true
	});

	const {
		elements: { trigger: sortTrigger, content: sortContent, arrow },
		states: { open: sortOpen }
	} = createPopover({
		forceVisible: true,
		positioning: {
			placement: 'bottom-end'
		}
	});

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
		advancedFilters = {
			wheelchairAccessible: false,
			breakfastIncluded: false,
			kidsFreeTour: false
		};
	}

	function handleClearAdvancedFilters() {
		const patch: Record<string, any> = {};
		advancedFiltersConfig.forEach((filter) => {
			patch[filter.key] = null as any;
			advancedFilters[filter.key] = false;
		});
		applyFilterPatch(patch);
	}

	function handleApplyAdvancedFilters() {
		const patch: Record<string, any> = {};
		advancedFiltersConfig.forEach((filter) => {
			patch[filter.key] = advancedFilters[filter.key] || null;
		});
		applyFilterPatch(patch);
		open.set(false);
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

		sortOpen.set(false);
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

<div class="mb-4 flex items-center justify-between">
	<h1 class="text-2xl font-bold">Destinos</h1>
	<a href="/destinations/new" class="btn btn-primary">
		<Plus />
		Nuevo destino
	</a>
</div>

<!-- Filters Bar -->
<div class="mb-4 flex flex-wrap gap-2">
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

	<!-- Advanced Filters Button -->
	<button class="btn btn-outline" use:melt={$advancedFiltersTrigger}>
		<FilterAlt />
		Filtros avanzados
		{#if hasFilters}
			<span class="badge badge-sm badge-primary">●</span>
		{/if}
	</button>

	<!-- Sort Button -->
	<button class="btn btn-outline" use:melt={$sortTrigger}>
		<svelte:component this={sort ? getSortIcon(sort.field) : ArrowSeparateVertical} />
		Ordenar
	</button>

	<!-- Clear Filters -->
	{#if hasFilters}
		<button class="btn btn-ghost" onclick={handleClearFilters}>
			<Cancel />
			Limpiar filtros
		</button>
	{/if}
</div>

<!-- Results Info -->
<div class="mb-4 text-sm text-base-content/70">
	Mostrando {items.length > 0 ? (pagination.page - 1) * pageSize + 1 : 0} - {Math.min(
		pagination.page * pageSize,
		total
	)} de {total} resultados
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
		<Pagination
			currentPage={pagination.page}
			totalPages={pagination.totalPages}
			{pageSize}
			{total}
			onPageChange={handlePageChange}
			onPageSizeChange={handlePageSizeChange}
		/>
	</div>
{/if}

<!-- Advanced Filters Dialog -->
{#if $open}
	<div use:melt={$portalled}>
		<div
			use:melt={$overlay}
			class="fixed inset-0 z-50 bg-black/50"
			transition:fade={{ duration: 150 }}
		/>
		<div
			class="fixed top-1/2 left-1/2 z-50 max-h-[85vh] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-base-100 p-6 shadow-lg"
			use:melt={$content}
			transition:scale={{ duration: 150, start: 0.95 }}
		>
			<h2 use:melt={$title} class="mb-4 text-lg font-bold">Filtros avanzados</h2>

			<div class="space-y-4">
				{#each advancedFiltersConfig as filter}
					<label class="label cursor-pointer justify-start gap-4">
						<input type="checkbox" class="checkbox" bind:checked={advancedFilters[filter.key]} />
						<span class="label-text">{filter.label}</span>
					</label>
				{/each}
			</div>

			<div class="mt-6 flex justify-end gap-2">
				<button class="btn btn-ghost" onclick={handleClearAdvancedFilters}>Limpiar</button>
				<button class="btn btn-primary" onclick={handleApplyAdvancedFilters}>Aplicar</button>
			</div>

			<button use:melt={$close} class="btn absolute top-4 right-4 btn-circle btn-ghost btn-sm">
				<Cancel />
			</button>
		</div>
	</div>
{/if}

<!-- Sort Popover -->
{#if $sortOpen}
	<div use:melt={$sortContent} transition:fade={{ duration: 100 }} class="z-50">
		<div use:melt={$arrow} />
		<div class="menu rounded-box bg-base-100 p-2 shadow-lg">
			{#each columns.filter((c) => c.sortable) as column}
				<button
					class="btn justify-start btn-ghost btn-sm"
					onclick={() => handleSort(String(column.key))}
				>
					<svelte:component this={getSortIcon(String(column.key))} />
					{column.title || String(column.key)}
				</button>
			{/each}
		</div>
	</div>
{/if}
