<script lang="ts">
	import * as m from '$paraglide/messages';
	import type { PageProps } from './$types';
	import type { ContentBlocksFilters } from './schemas/filters.schema';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import type { PatchValue } from '$lib/utils/filters';
	import { patchFilters } from '$lib/utils/filters';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { contentBlocksFiltersSchema } from './schemas/filters.schema';
	import { CONTENT_BLOCK_KIND_OPTIONS } from '$lib/labels/contentBlocks';
	import { CONTENT_BLOCK_ROUTES } from '$lib/config/routes/backoffice/contentBlocks';

	import Pagination from '$lib/components/backoffice/MeltPagination.svelte';
	import FilterSelect from '$lib/components/backoffice/filters/FilterSelect.svelte';
	import TableSortableHeader from '$lib/components/backoffice/tables/TableSortableHeader.svelte';
	import TableResetSort from '$lib/components/backoffice/tables/TableResetSort.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';
	import { Add, Magnifier } from '$lib/icons/Linear';

	let { data }: PageProps = $props();

	const items = $derived(data.items);
	const pagination = $derived(data.pagination);
	const filters = $derived(data.filters as ContentBlocksFilters);
	const sort = $derived(data.sort);
	const pageSize = $derived(pagination?.pageSize ?? 10);
	const total = $derived(pagination?.total ?? 0);

	let searchQuery = $derived(filters.q || '');

	function applyFilterPatch(patch: {
		[K in keyof ContentBlocksFilters]?: PatchValue<ContentBlocksFilters[K]>;
	}) {
		const newParams = patchFilters(contentBlocksFiltersSchema, page.url.searchParams, patch);
		goto(`?${newParams.toString()}`, { keepFocus: true, noScroll: true });
	}

	function handleSearch() {
		applyFilterPatch({ q: searchQuery || null });
	}

	function handleFilterChange(filterKey: string, value: string | null) {
		applyFilterPatch({
			[filterKey]: value
		} as { [K in keyof ContentBlocksFilters]?: PatchValue<ContentBlocksFilters[K]> });
	}

	function handlePageChange(newPage: number) {
		applyFilterPatch({ page: newPage });
	}
</script>

<svelte:head>
	<title>{m.contentBlocks_listPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.contentBlocks_listTitle()} breadcrumbs={data.breadcrumbs} />

<div class="bnd-filter-bar card flex-row items-center gap-6 p-2">
	<div class="flex w-full items-center gap-2">
		<input
			type="text"
			placeholder={m.contentBlocks_searchPlaceholder()}
			class="input-bordered input w-full"
			bind:value={searchQuery}
			onkeydown={(e) => e.key === 'Enter' && handleSearch()}
		/>
		<button class="btn btn-square btn-outline btn-primary" onclick={handleSearch}>
			<Magnifier class="size-5" />
		</button>
	</div>

	<FilterSelect
		options={CONTENT_BLOCK_KIND_OPTIONS}
		filterKey="kind"
		currentValue={filters.kind}
		placeholder={m.contentBlocks_filterKindPlaceholder()}
		clearTooltip={m.contentBlocks_filterKindClear()}
		onFilterChange={handleFilterChange}
	/>

	<a href={CONTENT_BLOCK_ROUTES.create} class="btn btn-outline btn-primary ml-auto">
		<Add class="size-5" />
		{m.contentBlocks_newResource()}
	</a>
</div>

<div class="card mt-6">
	<table class="table-zebra table-sm table">
		<thead>
			<tr>
				<th>
					<TableSortableHeader
						title={m.contentBlocks_columnTitle()}
						field="TITLE"
						currentSort={sort}
						onSortChange={(newSort) =>
							applyFilterPatch({
								sort: newSort.field as ContentBlocksFilters['sort'],
								order: newSort.order
							})}
					/>
				</th>
				<th>
					<TableSortableHeader
						title={m.contentBlocks_columnKind()}
						field="KIND"
						currentSort={sort}
						onSortChange={(newSort) =>
							applyFilterPatch({
								sort: newSort.field as ContentBlocksFilters['sort'],
								order: newSort.order
							})}
					/>
				</th>
				<th>
					<span>{m.contentBlocks_columnTarget()}</span>
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
							<p class="text-base-content/50">{m.contentBlocks_emptyState()}</p>
						</div>
					</td>
				</tr>
			{:else}
				{#each items as item (item.id)}
					{@const thumbUrl = item.images?.[0]?.variants
						? Object.values(item.images[0].variants)[0]
						: undefined}
					<tr>
						<td>
							<div class="flex items-center gap-3">
								{#if thumbUrl}
									<a
										href={buildUrlWithFilters(
											CONTENT_BLOCK_ROUTES.edit(item.id),
											page.url.searchParams
										)}
										class="shrink-0"
									>
										<img
											src={thumbUrl}
											alt={item.title}
											class="h-12 w-12 rounded-md object-cover"
										/>
									</a>
								{/if}
								<div>
									<p class="font-medium">
										<a
											href={buildUrlWithFilters(
												CONTENT_BLOCK_ROUTES.edit(item.id),
												page.url.searchParams
											)}
										>
											{item.title}
										</a>
									</p>
									{#if item.description}
										<p class="text-base-content/50 mt-0.5 line-clamp-1 text-xs">
											{item.description}
										</p>
									{/if}
								</div>
							</div>
						</td>
						<td>
							<span class="badge badge-outline badge-sm">
								{CONTENT_BLOCK_KIND_OPTIONS.find((o) => o.id === item.kind)?.name || item.kind}
							</span>
						</td>
						<td>
							<span class="text-base-content/70 max-w-xs truncate text-sm">{item.target}</span>
						</td>
						<td class="w-0 text-right">
							<div class="dropdown dropdown-end dropdown-bottom">
								<div tabindex="0" role="button" class="text-bold btn btn-sm m-1">⋮</div>
								<ul tabindex="-1" class="dropdown-content menu">
									<li>
										<a
											href={buildUrlWithFilters(
												CONTENT_BLOCK_ROUTES.edit(item.id),
												page.url.searchParams
											)}
										>
											{m.contentBlocks_editButton()}
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
