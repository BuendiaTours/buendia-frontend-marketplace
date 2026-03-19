<script lang="ts">
	/**
	 * Pickup points list page.
	 * Displays a filterable, sortable, paginated table of pickup points.
	 */
	import * as m from '$paraglide/messages';
	import type { PageProps } from './$types';
	import type { PickupPointsFilters } from './schemas/filters.schema';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import type { PatchValue } from '$lib/utils/filters';
	import { patchFilters } from '$lib/utils/filters';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { pickupPointsFiltersSchema } from './schemas/filters.schema';
	import { PICKUP_POINT_ROUTES } from '$lib/config/routes/backoffice/pickupPoints';

	import Pagination from '$lib/components/backoffice/MeltPagination.svelte';
	import TableSortableHeader from '$lib/components/backoffice/tables/TableSortableHeader.svelte';
	import TableResetSort from '$lib/components/backoffice/tables/TableResetSort.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';
	import { Add, Magnifier } from '$lib/icons/Linear';

	let { data }: PageProps = $props();

	const items = $derived(data.items);
	const pagination = $derived(data.pagination);
	const filters = $derived(data.filters as PickupPointsFilters);
	const sort = $derived(data.sort);
	const pageSize = $derived(pagination?.pageSize ?? 10);
	const total = $derived(pagination?.total ?? 0);

	let searchQuery = $derived(filters.q || '');

	function applyFilterPatch(patch: {
		[K in keyof PickupPointsFilters]?: PatchValue<PickupPointsFilters[K]>;
	}) {
		const currentParams = page.url.searchParams;
		const newParams = patchFilters(pickupPointsFiltersSchema, currentParams, patch);
		goto(`?${newParams.toString()}`, { keepFocus: true, noScroll: true });
	}

	function handleSearch() {
		applyFilterPatch({ q: searchQuery || null });
	}

	function handlePageChange(newPage: number) {
		applyFilterPatch({ page: newPage });
	}
</script>

<svelte:head>
	<title>{m.pickupPoints_listPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.pickupPoints_listTitle()} breadcrumbs={data.breadcrumbs} />

<div class="bnd-filter-bar card flex-row items-center gap-6 p-2">
	<div class="flex w-full items-center gap-2">
		<input
			type="text"
			placeholder={m.pickupPoints_searchPlaceholder()}
			class="input-bordered input w-full"
			bind:value={searchQuery}
			onkeydown={(e) => e.key === 'Enter' && handleSearch()}
		/>
		<button class="btn btn-square btn-outline btn-primary" onclick={handleSearch}>
			<Magnifier class="size-5" />
		</button>
	</div>

	<a href={PICKUP_POINT_ROUTES.create} class="btn btn-outline btn-primary ml-auto">
		<Add class="size-5" />
		{m.pickupPoints_newResource()}
	</a>
</div>

<div class="card mt-6">
	<table class="table-zebra table-sm table">
		<thead>
			<tr>
				<th>
					<TableSortableHeader
						title={m.pickupPoints_columnName()}
						field="NAME"
						currentSort={sort}
						onSortChange={(newSort) =>
							applyFilterPatch({
								sort: newSort.field as PickupPointsFilters['sort'],
								order: newSort.order
							})}
					/>
				</th>
				<th>{m.pickupPoints_columnCity()}</th>
				<th>{m.pickupPoints_columnCountryCode()}</th>
				<th>{m.pickupPoints_columnHotels()}</th>
				<th class="w-0">
					<TableResetSort currentSort={sort} />
				</th>
			</tr>
		</thead>
		<tbody>
			{#if items.length === 0}
				<tr>
					<td colspan="5" class="text-center">
						<div class="py-8">
							<p class="text-base-content/50">{m.pickupPoints_emptyState()}</p>
						</div>
					</td>
				</tr>
			{:else}
				{#each items as item (item.id)}
					<tr>
						<td>
							<a
								href={buildUrlWithFilters(PICKUP_POINT_ROUTES.edit(item.id), page.url.searchParams)}
							>
								{item.name}
							</a>
							{#if item.address}
								<p class="text-base-content/50 text-xs">{item.address}</p>
							{/if}
						</td>
						<td>{item.city ?? '—'}</td>
						<td>{item.countryCode ?? '—'}</td>
						<td>{item.hotels?.length ?? 0}</td>
						<td class="w-0 text-right">
							<div class="dropdown dropdown-end dropdown-bottom">
								<div tabindex="0" role="button" class="text-bold btn btn-sm m-1">⋮</div>
								<ul tabindex="-1" class="dropdown-content menu">
									<li>
										<a
											href={buildUrlWithFilters(
												PICKUP_POINT_ROUTES.edit(item.id),
												page.url.searchParams
											)}>{m.pickupPoints_editButton()}</a
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
