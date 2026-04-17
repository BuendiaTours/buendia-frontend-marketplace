<script lang="ts">
	/**
	 * Activities list page.
	 * Displays a filterable, sortable, paginated table of activities.
	 */
	import * as m from '$paraglide/messages';
	import type { PageProps } from './$types';
	import type { ActivitiesFilters } from './schemas/filters.schema';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import type { PatchValue } from '$lib/utils/filters';
	import { patchFilters } from '$lib/utils/filters';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { activitiesFiltersSchema } from './schemas/filters.schema';
	import { ACTIVITY_STATUS_OPTIONS } from '$lib/labels/activities';
	import { ACTIVITY_ROUTES } from '$lib/config/routes/backoffice/activities';

	import Pagination from '$lib/components/backoffice/MeltPagination.svelte';
	import FilterSelect from '$lib/components/backoffice/filters/FilterSelect.svelte';
	import TableSortableHeader from '$lib/components/backoffice/tables/TableSortableHeader.svelte';
	import TableResetSort from '$lib/components/backoffice/tables/TableResetSort.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';
	import { Add, GalleryMinimalistic, Magnifier } from '$lib/icons/Linear';

	let { data }: PageProps = $props();

	const items = $derived(data.items);
	const pagination = $derived(data.pagination);
	const filters = $derived(data.filters as ActivitiesFilters);
	const sort = $derived(data.sort);
	const pageSize = $derived(pagination?.pageSize ?? 10);
	const total = $derived(pagination?.total ?? 0);

	let searchQuery = $derived(filters.q || '');

	function applyFilterPatch(patch: {
		[K in keyof ActivitiesFilters]?: PatchValue<ActivitiesFilters[K]>;
	}) {
		const currentParams = page.url.searchParams;
		const newParams = patchFilters(activitiesFiltersSchema, currentParams, patch);
		goto(`?${newParams.toString()}`, { keepFocus: true, noScroll: true });
	}

	function handleSearch() {
		applyFilterPatch({ q: searchQuery || null });
	}

	function handleFilterChange(filterKey: string, value: string | null) {
		applyFilterPatch({
			[filterKey]: value
		} as { [K in keyof ActivitiesFilters]?: PatchValue<ActivitiesFilters[K]> });
	}

	function handlePageChange(newPage: number) {
		applyFilterPatch({ page: newPage });
	}
</script>

<svelte:head>
	<title>{m.activities_listPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.activities_listTitle()} breadcrumbs={data.breadcrumbs} />

<!-- Filters Bar -->
<div class="bnd-filter-bar card flex-row items-center gap-6 p-2">
	<div class="flex w-full items-center gap-2">
		<input
			type="text"
			placeholder={m.activities_searchPlaceholder()}
			class="input-bordered input w-full"
			bind:value={searchQuery}
			onkeydown={(e) => e.key === 'Enter' && handleSearch()}
		/>
		<button class="btn btn-square btn-outline btn-primary" onclick={handleSearch}>
			<Magnifier class="size-5" />
		</button>
	</div>

	<FilterSelect
		options={ACTIVITY_STATUS_OPTIONS}
		filterKey="status"
		currentValue={filters.status}
		placeholder={m.activities_filterStatusPlaceholder()}
		clearTooltip={m.activities_filterStatusClear()}
		onFilterChange={handleFilterChange}
	/>

	<a href={ACTIVITY_ROUTES.create} class="btn btn-outline btn-primary ml-auto">
		<Add class="size-5" />
		{m.activities_newActivity()}
	</a>
</div>

<!-- Table -->
<div class="card mt-6">
	<table class="table-zebra table-sm table">
		<thead>
			<tr>
				<th>
					<TableSortableHeader
						title={m.activities_columnTitle()}
						field="title"
						currentSort={sort}
						onSortChange={(newSort) =>
							applyFilterPatch({
								sort: newSort.field as ActivitiesFilters['sort'],
								order: newSort.order
							})}
					/>
				</th>
				<th>
					<span>{m.activities_columnStatus()}</span>
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
							<p class="text-base-content/50">{m.activities_emptyState()}</p>
						</div>
					</td>
				</tr>
			{:else}
				{#each items as item (item.id)}
					{@const thumbnail =
						item.images?.[0]?.variants?.['THUMBNAIL'] ??
						item.images?.[0]?.variants?.['CARD'] ??
						Object.values(item.images?.[0]?.variants ?? {})[0]}
					<tr>
						<td>
							<div class="flex items-center gap-3">
								<div class="avatar">
									<div class="bg-base-200 h-10 w-10 rounded-lg">
										{#if thumbnail}
											<img src={thumbnail} alt={item.title} />
										{:else}
											<div class="flex h-full w-full items-center justify-center">
												<GalleryMinimalistic class="text-base-content/30 size-5" />
											</div>
										{/if}
									</div>
								</div>
								<div>
									<a
										href={buildUrlWithFilters(ACTIVITY_ROUTES.edit(item.id), page.url.searchParams)}
										class="font-medium"
									>
										{item.title}
									</a>
									<p class="text-base-content/50 text-xs">{item.slug}</p>
								</div>
							</div>
						</td>
						<td>
							{#if item.status === 'PUBLISHED' || item.status === 'APPROVED'}
								<div aria-label="success" class="status status-lg status-success mr-1"></div>
							{:else if item.status === 'DRAFT' || item.status === 'PENDING_REVIEW'}
								<div aria-label="status" class="status status-lg status-neutral mr-1"></div>
							{:else}
								<div aria-label="error" class="status status-lg status-error mr-1"></div>
							{/if}
							<span
								>{ACTIVITY_STATUS_OPTIONS.find((s) => s.id === item.status)?.name ||
									item.status}</span
							>
						</td>
						<td class="w-0 text-right">
							<div class="dropdown dropdown-end dropdown-bottom">
								<div tabindex="0" role="button" class="text-bold btn btn-sm m-1">⋮</div>
								<ul tabindex="-1" class="dropdown-content menu">
									<li>
										<a
											href={buildUrlWithFilters(
												ACTIVITY_ROUTES.edit(item.id),
												page.url.searchParams
											)}
										>
											{m.activities_editButton()}
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
