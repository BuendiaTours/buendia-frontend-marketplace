<script lang="ts">
	import type { User } from '$core/users/types';
	import type { Column } from '$lib/types';
	import type { CriteriaSortOption } from '$core/_shared/enums';
	import type { UsersFilters } from './schemas/filters.schema';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import type { PatchValue } from '$lib/utils/filters';
	import { patchFilters, clearAllFilters, hasActiveFilters } from '$lib/utils/filters';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { usersFiltersSchema } from './schemas/filters.schema';

	import { USER_ROUTES } from '$lib/config/routes/backoffice/users';
	import { UserStatus, UserSortAttribute } from '$core/users/enums';
	import { USER_KIND_OPTIONS, USER_STATUS_OPTIONS } from '$lib/labels/users';

	import Pagination from '$lib/components/backoffice/MeltPagination.svelte';
	import FilterSelect from '$lib/components/backoffice/filters/FilterSelect.svelte';
	import PagecountAboveTable from '$lib/layout/backoffice/partials/PagecountAboveTable.svelte';
	import TableSortableHeader from '$lib/components/backoffice/tables/TableSortableHeader.svelte';
	import TableResetSort from '$lib/components/backoffice/tables/TableResetSort.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	import { Cancel, Plus, Search } from 'svelte-iconoir';
	import * as m from '$paraglide/messages';

	let {
		data
	}: {
		data: {
			items: User[];
			pagination: {
				page: number;
				pageSize: number;
				total: number;
				totalPages: number;
			} | null;
			filters: UsersFilters;
			sort: { field: string; order: CriteriaSortOption } | null;
			breadcrumbs: Array<{ label: string; href?: string }>;
		};
	} = $props();

	const items = $derived(data.items);
	const pagination = $derived(data.pagination);
	const filters = $derived(data.filters);
	const sort = $derived(data.sort);
	const pageSize = $derived(pagination?.pageSize ?? 10);
	const total = $derived(pagination?.total ?? 0);

	// Necesitamos $state + $effect: los inputs requieren estado mutable local que se sincronice desde la URL.
	// $derived no permite bind:value porque sus propiedades no son reactivas para escritura.
	// eslint-disable-next-line svelte/prefer-writable-derived
	let filterValues = $state<UsersFilters>({});
	$effect(() => {
		filterValues = filters;
	});

	function applyFilterPatch(patch: {
		[K in keyof UsersFilters]?: PatchValue<UsersFilters[K]>;
	}) {
		const currentParams = page.url.searchParams;
		const newParams = patchFilters(usersFiltersSchema, currentParams, patch);
		goto(`?${newParams.toString()}`, {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	}

	function handleClearFilters() {
		clearAllFilters(page.url.pathname, page.url.searchParams, goto);
		filterValues = {};
	}

	function handleSearch() {
		applyFilterPatch({
			q: filterValues.q ?? undefined,
			email: filterValues.email ?? undefined,
			phone: filterValues.phone ?? undefined,
			kind: filterValues.kind,
			status: filterValues.status
		});
	}

	function handleFilterChange(filterKey: string, value: string | null) {
		applyFilterPatch({
			[filterKey]: value
		} as { [K in keyof UsersFilters]?: PatchValue<UsersFilters[K]> });
	}

	const columns: Column<User>[] = [
		{ key: 'name', title: m.users_name(), sortable: true, sortField: UserSortAttribute.NAME },
		{ key: 'email', title: m.users_email(), sortable: false },
		{ key: 'kind', title: m.users_kind(), sortable: false },
		{ key: 'status', title: m.users_status(), sortable: false }
	];

	function handlePageChange(newPage: number) {
		applyFilterPatch({ page: newPage });
	}

	const hasFilters = $derived(hasActiveFilters(filters));
</script>

<svelte:head>
	<title>{m.users_listPageTitle()}</title>
</svelte:head>

<LocationBar title={m.users_listLabel()} breadcrumbs={data.breadcrumbs} />

<div class="bnd-filter-bar card flex-row flex-wrap items-center gap-4 p-4">
	<div class="flex flex-1 items-center gap-2">
		<input
			type="text"
			placeholder={m.users_searchPlaceholder()}
			class="input-bordered input input-sm w-48"
			bind:value={filterValues.q}
			onkeydown={(e) => e.key === 'Enter' && handleSearch()}
		/>
		<input
			type="text"
			placeholder={m.users_placeholderEmail()}
			class="input-bordered input input-sm w-48"
			bind:value={filterValues.email}
			onkeydown={(e) => e.key === 'Enter' && handleSearch()}
		/>
		<input
			type="text"
			placeholder={m.users_placeholderPhone()}
			class="input-bordered input input-sm w-40"
			bind:value={filterValues.phone}
			onkeydown={(e) => e.key === 'Enter' && handleSearch()}
		/>
		<FilterSelect
			options={USER_KIND_OPTIONS}
			filterKey="kind"
			currentValue={filters.kind}
			placeholder={m.users_placeholderKind()}
			clearTooltip={m.users_clearKind()}
			width="w-32"
			onFilterChange={handleFilterChange}
		/>
		<FilterSelect
			options={USER_STATUS_OPTIONS}
			filterKey="status"
			currentValue={filters.status}
			placeholder={m.users_placeholderStatus()}
			clearTooltip={m.users_clearStatus()}
			width="w-36"
			onFilterChange={handleFilterChange}
		/>
		<button class="btn btn-square btn-outline btn-primary btn-sm" onclick={handleSearch}>
			<Search />
		</button>
	</div>

	<div class="flex items-center gap-2">
		<div class="tooltip" data-tip={m.users_clearAllFilters()}>
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

<div class="mt-6 flex items-center justify-between">
	<PagecountAboveTable itemsLength={items.length} {pagination} />

	<a href={USER_ROUTES.create} class="btn btn-outline btn-primary">
		<Plus />
		{m.users_newUser()}
	</a>
</div>

<div class="card mt-6">
	<table class="table-zebra table-sm table">
		<thead>
			<tr>
				{#each columns as col (col.key)}
					<th>
						{#if col.sortable}
							<TableSortableHeader
								title={col.title}
								field={col.sortField ?? String(col.key)}
								currentSort={sort}
								onSortChange={(newSort) => {
									if (newSort.field && newSort.order) {
										applyFilterPatch({
											sort: newSort.field as UserSortAttribute,
											order: newSort.order
										});
									} else {
										applyFilterPatch({ sort: null, order: null });
									}
								}}
							/>
						{:else}
							<span>{col.title}</span>
						{/if}
					</th>
				{/each}
				<th class="w-0">
					<TableResetSort currentSort={sort} />
				</th>
			</tr>
		</thead>
		<tbody>
			{#if items.length === 0}
				<tr>
					<td colspan={columns.length + 1} class="text-center">
						<div class="py-8">
							<p class="text-base-content/50">{m.users_noUsers()}</p>
						</div>
					</td>
				</tr>
			{:else}
				{#each items as item (item.id)}
					<tr>
						<td>
							<a href={buildUrlWithFilters(USER_ROUTES.detail(item.id), page.url.searchParams)}>
								{item.name}
							</a>
						</td>
						<td>{item.email}</td>
						<td>
							<span class="badge badge-sm">{item.kind}</span>
						</td>
						<td>
							<span
								class="badge badge-sm"
								class:badge-success={item.status === UserStatus.ACTIVE}
								class:badge-warning={item.status === UserStatus.SUSPENDED}
								class:badge-error={item.status === UserStatus.INACTIVE}
							>
								{item.status}
							</span>
						</td>
						<td class="w-0 text-right">
							<div class="dropdown dropdown-end dropdown-bottom">
								<div tabindex="0" role="button" class="text-bold btn btn-sm m-1">...</div>
								<ul tabindex="-1" class="dropdown-content menu">
									<li>
										<a
											href={buildUrlWithFilters(USER_ROUTES.detail(item.id), page.url.searchParams)}
										>
											{m.users_view()}
										</a>
									</li>
									<li>
										<a href={buildUrlWithFilters(USER_ROUTES.edit(item.id), page.url.searchParams)}
											>{m.common_edit()}</a
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
		<Pagination count={total} perPage={pageSize} onPageChange={handlePageChange} />
	</div>
{/if}
