<script lang="ts">
	/**
	 * Attractions list page.
	 * Displays a filterable, sortable, paginated table of attractions.
	 */
	import * as m from '$paraglide/messages';
	import type { PageProps } from './$types';
	import type { AttractionsFilters } from './schemas/filters.schema';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import type { PatchValue } from '$lib/utils/filters';
	import { patchFilters } from '$lib/utils/filters';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { attractionsFiltersSchema } from './schemas/filters.schema';
	import { ATTRACTION_STATUS_OPTIONS } from '$lib/labels/attractions';
	import { ATTRACTION_ROUTES } from '$lib/config/routes/backoffice/attractions';

	import Pagination from '$lib/components/backoffice/MeltPagination.svelte';
	import FilterSelect from '$lib/components/backoffice/filters/FilterSelect.svelte';
	import TableSortableHeader from '$lib/components/backoffice/tables/TableSortableHeader.svelte';
	import TableResetSort from '$lib/components/backoffice/tables/TableResetSort.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';
	import Tag from '$lib/components/backoffice/Tag.svelte';
	import { Add, Magnifier } from '$lib/icons/Linear';

	let { data }: PageProps = $props();

	const items = $derived(data.items);
	const pagination = $derived(data.pagination);
	const filters = $derived(data.filters as AttractionsFilters);
	const sort = $derived(data.sort);
	const pageSize = $derived(pagination?.pageSize ?? 10);
	const total = $derived(pagination?.total ?? 0);

	let searchQuery = $derived(filters.q || '');

	function applyFilterPatch(patch: {
		[K in keyof AttractionsFilters]?: PatchValue<AttractionsFilters[K]>;
	}) {
		const currentParams = page.url.searchParams;
		const newParams = patchFilters(attractionsFiltersSchema, currentParams, patch);
		goto(`?${newParams.toString()}`, { keepFocus: true, noScroll: true });
	}

	function handleSearch() {
		applyFilterPatch({ q: searchQuery || null });
	}

	function handleStatusFilterChange(filterKey: string, value: string | null) {
		applyFilterPatch({
			[filterKey]: value
		} as { [K in keyof AttractionsFilters]?: PatchValue<AttractionsFilters[K]> });
	}

	function handlePageChange(newPage: number) {
		applyFilterPatch({ page: newPage });
	}
</script>

<svelte:head>
	<title>{m.attractions_listPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.attractions_listTitle()} breadcrumbs={data.breadcrumbs} />

<!-- Filters Bar -->
<div class="bnd-filter-bar card flex-row items-center gap-6 p-2">
	<div class="flex w-full items-center gap-2">
		<input
			type="text"
			placeholder={m.attractions_searchPlaceholder()}
			class="input-bordered input w-full"
			bind:value={searchQuery}
			onkeydown={(e) => e.key === 'Enter' && handleSearch()}
		/>
		<button class="btn btn-square btn-outline btn-primary" onclick={handleSearch}>
			<Magnifier class="size-5" />
		</button>
	</div>

	<FilterSelect
		options={ATTRACTION_STATUS_OPTIONS}
		filterKey="status"
		currentValue={filters.status}
		placeholder={m.attractions_filterStatusPlaceholder()}
		clearTooltip={m.attractions_filterStatusClear()}
		onFilterChange={handleStatusFilterChange}
	/>

	<a href={ATTRACTION_ROUTES.create} class="btn btn-outline btn-primary ml-auto">
		<Add class="size-5" />
		{m.attractions_newAttraction()}
	</a>
</div>

<!-- Table -->
<div class="card mt-6">
	<table class="table-zebra table-sm table">
		<thead>
			<tr>
				<th>
					<TableSortableHeader
						title={m.attractions_columnName()}
						field="name"
						currentSort={sort}
						onSortChange={(newSort) =>
							applyFilterPatch({
								sort: newSort.field as AttractionsFilters['sort'],
								order: newSort.order
							})}
					/>
				</th>
				<th>
					<span>{m.attractions_columnDestinations()}</span>
				</th>
				<th>
					<span>{m.attractions_columnStatus()}</span>
				</th>
				<th class="w-0">
					<TableResetSort currentSort={sort} />
				</th>
			</tr>
		</thead>
		<tbody>
			{#if items.length === 0}
				<tr>
					<td colspan="4" class="text-center">
						<div class="py-8">
							<p class="text-base-content/50">{m.attractions_emptyState()}</p>
						</div>
					</td>
				</tr>
			{:else}
				{#each items as item (item.id)}
					<tr>
						<td>
							<p>
								<a
									href={buildUrlWithFilters(ATTRACTION_ROUTES.edit(item.id), page.url.searchParams)}
								>
									{item.name}
								</a>
							</p>
							{#if item.description}
								<p class="text-base-content/50 text-xs">{item.description}</p>
							{/if}
						</td>
						<td>
							{#if item.locations.length > 0}
								<div class="flex flex-wrap gap-1">
									{#each item.locations as loc (loc.id)}
										<Tag class="badge-outline badge-sm">{loc.name}</Tag>
									{/each}
								</div>
							{/if}
						</td>
						<td>
							{#if item.status === 'ACTIVE'}
								<div aria-label="success" class="status status-lg status-success mr-1"></div>
								<span>{ATTRACTION_STATUS_OPTIONS.find((o) => o.id === 'ACTIVE')?.name}</span>
							{:else if item.status === 'DRAFT'}
								<div aria-label="status" class="status status-lg status-neutral mr-1"></div>
								<span>{ATTRACTION_STATUS_OPTIONS.find((o) => o.id === 'DRAFT')?.name}</span>
							{:else}
								<div aria-label="error" class="status status-lg status-error mr-1"></div>
								<span>{ATTRACTION_STATUS_OPTIONS.find((o) => o.id === 'INACTIVE')?.name}</span>
							{/if}
						</td>
						<td class="w-0 text-right">
							<div class="dropdown dropdown-end dropdown-bottom">
								<div tabindex="0" role="button" class="text-bold btn btn-sm m-1">⋮</div>
								<ul tabindex="-1" class="dropdown-content menu">
									<li>
										<a
											href={buildUrlWithFilters(
												ATTRACTION_ROUTES.edit(item.id),
												page.url.searchParams
											)}
										>
											{m.attractions_editButton()}
										</a>
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
