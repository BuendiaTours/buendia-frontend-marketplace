<script lang="ts">
	/**
	 * FAQs list page.
	 * Displays a filterable, sortable, paginated table of FAQs.
	 */
	import * as m from '$paraglide/messages';
	import type { PageProps } from './$types';
	import type { FaqsFilters } from './schemas/filters.schema';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import type { PatchValue } from '$lib/utils/filters';
	import { patchFilters } from '$lib/utils/filters';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { faqsFiltersSchema } from './schemas/filters.schema';
	import { FAQ_STATUS_OPTIONS } from '$lib/labels/faqs';
	import { FAQ_ROUTES } from '$lib/config/routes/backoffice/faqs';

	import Pagination from '$lib/components/backoffice/MeltPagination.svelte';
	import FilterSelect from '$lib/components/backoffice/filters/FilterSelect.svelte';
	import TableSortableHeader from '$lib/components/backoffice/tables/TableSortableHeader.svelte';
	import TableResetSort from '$lib/components/backoffice/tables/TableResetSort.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';
	import { Add, Magnifier } from '$lib/icons/Linear';

	let { data }: PageProps = $props();

	const items = $derived(data.items);
	const pagination = $derived(data.pagination);
	const filters = $derived(data.filters as FaqsFilters);
	const sort = $derived(data.sort);
	const pageSize = $derived(pagination?.pageSize ?? 10);
	const total = $derived(pagination?.total ?? 0);

	let searchQuery = $derived(filters.q || '');

	function applyFilterPatch(patch: {
		[K in keyof FaqsFilters]?: PatchValue<FaqsFilters[K]>;
	}) {
		const currentParams = page.url.searchParams;
		const newParams = patchFilters(faqsFiltersSchema, currentParams, patch);
		goto(`?${newParams.toString()}`, { keepFocus: true, noScroll: true });
	}

	function handleSearch() {
		applyFilterPatch({ q: searchQuery || null });
	}

	function handleStatusFilterChange(filterKey: string, value: string | null) {
		applyFilterPatch({
			[filterKey]: value
		} as { [K in keyof FaqsFilters]?: PatchValue<FaqsFilters[K]> });
	}

	function handlePageChange(newPage: number) {
		applyFilterPatch({ page: newPage });
	}
</script>

<svelte:head>
	<title>{m.faqs_listPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.faqs_listTitle()} breadcrumbs={data.breadcrumbs} />

<!-- Filters Bar -->
<div class="bnd-filter-bar card flex-row items-center gap-6 p-2">
	<div class="flex w-full items-center gap-2">
		<input
			type="text"
			placeholder={m.faqs_searchPlaceholder()}
			class="input-bordered input w-full"
			bind:value={searchQuery}
			onkeydown={(e) => e.key === 'Enter' && handleSearch()}
		/>
		<button class="btn btn-square btn-outline btn-primary" onclick={handleSearch}>
			<Magnifier class="size-5" />
		</button>
	</div>

	<FilterSelect
		options={FAQ_STATUS_OPTIONS}
		filterKey="status"
		currentValue={filters.status}
		placeholder={m.faqs_filterStatusPlaceholder()}
		clearTooltip={m.faqs_filterStatusClear()}
		onFilterChange={handleStatusFilterChange}
	/>

	<a href={FAQ_ROUTES.create} class="btn btn-outline btn-primary ml-auto">
		<Add class="size-5" />
		{m.faqs_newResource()}
	</a>
</div>

<!-- Table -->
<div class="card mt-6">
	<table class="table-zebra table-sm table">
		<thead>
			<tr>
				<th>
					<TableSortableHeader
						title={m.faqs_columnQuestion()}
						field="QUESTION"
						currentSort={sort}
						onSortChange={(newSort) =>
							applyFilterPatch({
								sort: newSort.field as FaqsFilters['sort'],
								order: newSort.order
							})}
					/>
				</th>
				<th>
					<span>{m.faqs_columnStatus()}</span>
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
							<p class="text-base-content/50">{m.faqs_emptyState()}</p>
						</div>
					</td>
				</tr>
			{:else}
				{#each items as item (item.id)}
					<tr>
						<td>
							<p>
								<a href={buildUrlWithFilters(FAQ_ROUTES.edit(item.id), page.url.searchParams)}>
									{item.question}
								</a>
							</p>
							{#if item.answer}
								<p class="text-base-content/50 max-w-md truncate text-xs">
									{item.answer}
								</p>
							{/if}
						</td>
						<td>
							{#if item.status === 'PUBLISHED'}
								<div class="flex items-center gap-1">
									<div aria-label="success" class="status status-lg status-success mr-1"></div>
									<span>{FAQ_STATUS_OPTIONS.find((o) => o.id === 'PUBLISHED')?.name}</span>
								</div>
							{:else}
								<div class="flex items-center gap-1">
									<div aria-label="status" class="status status-lg status-neutral mr-1"></div>
									<span>{FAQ_STATUS_OPTIONS.find((o) => o.id === 'DRAFT')?.name}</span>
								</div>
							{/if}
						</td>
						<td class="w-0 text-right">
							<div class="dropdown dropdown-end dropdown-bottom">
								<div tabindex="0" role="button" class="text-bold btn btn-sm m-1">...</div>
								<ul tabindex="-1" class="dropdown-content menu">
									<li>
										<a href={buildUrlWithFilters(FAQ_ROUTES.edit(item.id), page.url.searchParams)}>
											{m.faqs_editButton()}
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
		<Pagination count={total} perPage={pageSize} onPageChange={handlePageChange} />
	</div>
{/if}
