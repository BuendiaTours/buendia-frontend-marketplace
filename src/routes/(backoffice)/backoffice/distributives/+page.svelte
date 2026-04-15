<script lang="ts">
	/**
	 * Distributives list page.
	 * Displays a filterable, sortable, paginated table of distributives.
	 */
	import * as m from '$paraglide/messages';
	import type { PageProps } from './$types';
	import type { DistributivesFilters } from './schemas/filters.schema';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import type { PatchValue } from '$lib/utils/filters';
	import { patchFilters } from '$lib/utils/filters';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { distributivesFiltersSchema } from './schemas/filters.schema';
	import { DISTRIBUTIVE_STATUS_OPTIONS } from '$lib/labels/distributives';
	import { DISTRIBUTIVE_ROUTES } from '$lib/config/routes/backoffice/distributives';

	import Pagination from '$lib/components/backoffice/MeltPagination.svelte';
	import FilterSelect from '$lib/components/backoffice/filters/FilterSelect.svelte';
	import TableSortableHeader from '$lib/components/backoffice/tables/TableSortableHeader.svelte';
	import TableResetSort from '$lib/components/backoffice/tables/TableResetSort.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';
	import { Add, Magnifier } from '$lib/icons/Linear';

	let { data }: PageProps = $props();

	const items = $derived(data.items);
	const pagination = $derived(data.pagination);
	const filters = $derived(data.filters as DistributivesFilters);
	const sort = $derived(data.sort);
	const pageSize = $derived(pagination?.pageSize ?? 10);
	const total = $derived(pagination?.total ?? 0);

	let searchQuery = $derived.writable(filters.q || '');

	function applyFilterPatch(patch: {
		[K in keyof DistributivesFilters]?: PatchValue<DistributivesFilters[K]>;
	}) {
		const currentParams = page.url.searchParams;
		const newParams = patchFilters(distributivesFiltersSchema, currentParams, patch);
		goto(`?${newParams.toString()}`, { keepFocus: true, noScroll: true });
	}

	function handleSearch() {
		applyFilterPatch({ q: searchQuery || null });
	}

	function handleFilterChange(filterKey: string, value: string | null) {
		applyFilterPatch({ [filterKey]: value });
	}

	function handlePageChange(newPage: number) {
		applyFilterPatch({ page: newPage });
	}
</script>

<svelte:head>
	<title>{m.distributives_listPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.distributives_listTitle()} breadcrumbs={data.breadcrumbs} />

<!-- Filters Bar -->
<div class="bnd-filter-bar card flex-row items-center gap-6 p-2">
	<div class="flex w-full items-center gap-2">
		<input
			type="text"
			placeholder={m.distributives_searchPlaceholder()}
			class="input-bordered input w-full"
			bind:value={searchQuery}
			onkeydown={(e) => e.key === 'Enter' && handleSearch()}
		/>
		<button class="btn btn-square btn-outline btn-primary" onclick={handleSearch}>
			<Magnifier class="size-5" />
		</button>
	</div>

	<FilterSelect
		options={DISTRIBUTIVE_STATUS_OPTIONS}
		filterKey="status"
		currentValue={filters.status}
		placeholder={m.distributives_filterStatusPlaceholder()}
		clearTooltip={m.distributives_filterStatusClear()}
		onFilterChange={handleFilterChange}
	/>

	<a href={DISTRIBUTIVE_ROUTES.create} class="btn btn-outline btn-primary ml-auto">
		<Add class="size-5" />
		{m.distributives_newResource()}
	</a>
</div>

<!-- Table -->
<div class="card mt-6">
	<table class="table-zebra table-sm table">
		<thead>
			<tr>
				<th>
					<TableSortableHeader
						title={m.distributives_columnName()}
						field="name"
						currentSort={sort}
						onSortChange={(newSort) =>
							applyFilterPatch({
								sort: newSort.field as DistributivesFilters['sort'],
								order: newSort.order
							})}
					/>
				</th>
				<th>
					<span>{m.distributives_columnTotalActivities()}</span>
				</th>
				<th>
					<span>{m.distributives_columnStatus()}</span>
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
							<p class="text-base-content/50">{m.distributives_emptyState()}</p>
						</div>
					</td>
				</tr>
			{:else}
				{#each items as item (item.id)}
					<tr>
						<td>
							<p>
								<a
									href={buildUrlWithFilters(
										DISTRIBUTIVE_ROUTES.edit(item.id),
										page.url.searchParams
									)}
								>
									{item.name}
								</a>
							</p>
							<p class="text-base-content/50 text-xs">/{item.slug}</p>
						</td>
						<td>
							<span class="badge badge-outline badge-sm">{item.totalActivities}</span>
						</td>
						<td>
							{#if item.status === 'PUBLISHED'}
								<div aria-label="success" class="status status-lg status-success mr-1"></div>
								<span>{DISTRIBUTIVE_STATUS_OPTIONS.find((o) => o.id === 'PUBLISHED')?.name}</span>
							{:else}
								<div aria-label="status" class="status status-lg status-neutral mr-1"></div>
								<span>{DISTRIBUTIVE_STATUS_OPTIONS.find((o) => o.id === 'DRAFT')?.name}</span>
							{/if}
						</td>
						<td class="w-0 text-right">
							<div class="dropdown dropdown-end dropdown-bottom">
								<div tabindex="0" role="button" class="text-bold btn btn-sm m-1">&#8942;</div>
								<ul tabindex="-1" class="dropdown-content menu">
									<li>
										<a
											href={buildUrlWithFilters(
												DISTRIBUTIVE_ROUTES.edit(item.id),
												page.url.searchParams
											)}
										>
											{m.distributives_editButton()}
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
