<script lang="ts">
	/**
	 * Tags list page.
	 * Displays a filterable, sortable, paginated table of tags.
	 */
	import * as m from '$paraglide/messages';
	import type { PageProps } from './$types';
	import type { TagsFilters } from './schemas/filters.schema';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import type { PatchValue } from '$lib/utils/filters';
	import { patchFilters } from '$lib/utils/filters';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { tagsFiltersSchema } from './schemas/filters.schema';
	import { TAG_ROUTES } from '$lib/config/routes/backoffice/tags';

	import Pagination from '$lib/components/backoffice/MeltPagination.svelte';
	import TableSortableHeader from '$lib/components/backoffice/tables/TableSortableHeader.svelte';
	import TableResetSort from '$lib/components/backoffice/tables/TableResetSort.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';
	import { Add, Magnifier } from '$lib/icons/Linear';

	let { data }: PageProps = $props();

	const items = $derived(data.items);
	const pagination = $derived(data.pagination);
	const filters = $derived(data.filters as TagsFilters);
	const sort = $derived(data.sort);
	const pageSize = $derived(pagination?.pageSize ?? 10);
	const total = $derived(pagination?.total ?? 0);

	let searchQuery = $derived(filters.q || '');

	function applyFilterPatch(patch: {
		[K in keyof TagsFilters]?: PatchValue<TagsFilters[K]>;
	}) {
		const currentParams = page.url.searchParams;
		const newParams = patchFilters(tagsFiltersSchema, currentParams, patch);
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
	<title>{m.tags_listPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.tags_listTitle()} breadcrumbs={data.breadcrumbs} />

<!-- Filters Bar -->
<div class="bnd-filter-bar card flex-row items-center gap-6 p-2">
	<div class="flex w-full items-center gap-2">
		<input
			type="text"
			placeholder={m.tags_searchPlaceholder()}
			class="input-bordered input w-full"
			bind:value={searchQuery}
			onkeydown={(e) => e.key === 'Enter' && handleSearch()}
		/>
		<button class="btn btn-square btn-outline btn-primary" onclick={handleSearch}>
			<Magnifier class="size-5" />
		</button>
	</div>

	<a href={TAG_ROUTES.create} class="btn btn-outline btn-primary ml-auto">
		<Add class="size-5" />
		{m.tags_newTag()}
	</a>
</div>

<!-- Table -->
<div class="card mt-6">
	<table class="table-zebra table-sm table">
		<thead>
			<tr>
				<th>
					<TableSortableHeader
						title={m.tags_columnName()}
						field="name"
						currentSort={sort}
						onSortChange={(newSort) =>
							applyFilterPatch({
								sort: newSort.field as TagsFilters['sort'],
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
					<td colspan="2" class="text-center">
						<div class="py-8">
							<p class="text-base-content/50">{m.tags_emptyState()}</p>
						</div>
					</td>
				</tr>
			{:else}
				{#each items as item (item.id)}
					<tr>
						<td>
							<p>
								<a href={buildUrlWithFilters(TAG_ROUTES.edit(item.id), page.url.searchParams)}>
									{item.name}
								</a>
							</p>
						</td>
						<td class="w-0 text-right">
							<div class="dropdown dropdown-end dropdown-bottom">
								<div tabindex="0" role="button" class="text-bold btn btn-sm m-1">⋮</div>
								<ul tabindex="-1" class="dropdown-content menu">
									<li>
										<a href={buildUrlWithFilters(TAG_ROUTES.edit(item.id), page.url.searchParams)}>
											{m.tags_editButton()}
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
