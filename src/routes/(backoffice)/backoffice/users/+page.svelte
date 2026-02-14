<script lang="ts">
	import type { User } from '$core/users/types';
	import type { Column } from '$lib/types';
	import type { UsersFilters } from './filters.schema';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import type { PatchValue } from '$lib/utils/filters';
	import { patchFilters, clearAllFilters, hasActiveFilters } from '$lib/utils/filters';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { usersFiltersSchema } from './filters.schema';

	import { USER_ROUTES } from '$core/users/routes';
	import { UserKind, UserStatus } from '$core/users/enums';
	import { USER_KIND_OPTIONS, USER_STATUS_OPTIONS } from '$lib/labels/users';

	import Pagination from '$lib/components/backoffice/MeltPagination.svelte';
	import PagecountAboveTable from '$lib/layout/backoffice/partials/PagecountAboveTable.svelte';
	import TableSortableHeader from '$lib/components/backoffice/tables/TableSortableHeader.svelte';
	import TableResetSort from '$lib/components/backoffice/tables/TableResetSort.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	import { Cancel, Plus, Search } from 'svelte-iconoir';

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
			sort: { field: string; order: 'asc' | 'desc' } | null;
			breadcrumbs: Array<{ label: string; href?: string }>;
		};
	} = $props();

	const items = $derived(data.items);
	const pagination = $derived(data.pagination);
	const filters = $derived(data.filters);
	const sort = $derived(data.sort);
	const pageSize = $derived(pagination?.pageSize ?? 10);
	const total = $derived(pagination?.total ?? 0);

	let searchQuery = $state('');
	let emailFilter = $state('');
	let phoneFilter = $state('');
	let kindFilter = $state('');
	let statusFilter = $state('');

	$effect(() => {
		searchQuery = filters.q || '';
		emailFilter = filters.email || '';
		phoneFilter = filters.phone || '';
		kindFilter = filters.kind || '';
		statusFilter = filters.status || '';
	});

	async function applyFilterPatch(patch: {
		[K in keyof UsersFilters]?: PatchValue<UsersFilters[K]>;
	}) {
		const currentParams = page.url.searchParams;
		const newParams = patchFilters(usersFiltersSchema, currentParams, patch);
		const url = `${page.url.pathname}?${newParams.toString()}`;
		await goto(url, { keepFocus: true, noScroll: true, replaceState: true });
	}

	function handleClearFilters() {
		clearAllFilters(page.url.pathname, page.url.searchParams, goto);
		searchQuery = '';
		emailFilter = '';
		phoneFilter = '';
		kindFilter = '';
		statusFilter = '';
	}

	function handleSearch() {
		applyFilterPatch({
			q: searchQuery || null,
			email: emailFilter || null,
			phone: phoneFilter || null,
			kind: kindFilter || null,
			status: statusFilter || null
		});
	}

	const columns: Column<User>[] = [
		{ key: 'name', title: 'Nombre', sortable: true },
		{ key: 'email', title: 'Email', sortable: true },
		{ key: 'kind', title: 'Tipo', sortable: false },
		{ key: 'status', title: 'Estado', sortable: false }
	];

	function handlePageChange(newPage: number) {
		applyFilterPatch({ page: newPage });
	}

	const hasFilters = $derived(hasActiveFilters(filters));
</script>

<svelte:head>
	<title>Usuarios - Backoffice</title>
</svelte:head>

<LocationBar title="Listado de usuarios" breadcrumbs={data.breadcrumbs} />

<div class="bnd-filter-bar card flex-row flex-wrap items-center gap-4 p-4">
	<div class="flex flex-1 items-center gap-2">
		<input
			type="text"
			placeholder="Buscar (q)..."
			class="input-bordered input input-sm w-48"
			bind:value={searchQuery}
			onkeydown={(e) => e.key === 'Enter' && handleSearch()}
		/>
		<input
			type="text"
			placeholder="Email"
			class="input-bordered input input-sm w-48"
			bind:value={emailFilter}
			onkeydown={(e) => e.key === 'Enter' && applyFilterPatch({ email: emailFilter || null })}
		/>
		<input
			type="text"
			placeholder="Teléfono"
			class="input-bordered input input-sm w-40"
			bind:value={phoneFilter}
			onkeydown={(e) => e.key === 'Enter' && applyFilterPatch({ phone: phoneFilter || null })}
		/>
		<select
			class="select select-bordered select-sm w-32"
			aria-label="Tipo"
			bind:value={kindFilter}
			onchange={() => applyFilterPatch({ kind: kindFilter || null })}
		>
			<option value="">Tipo</option>
			{#each USER_KIND_OPTIONS as opt (opt.id)}
				<option value={opt.id}>{opt.name}</option>
			{/each}
		</select>
		<select
			class="select select-bordered select-sm w-36"
			aria-label="Estado"
			bind:value={statusFilter}
			onchange={() => applyFilterPatch({ status: statusFilter || null })}
		>
			<option value="">Estado</option>
			{#each USER_STATUS_OPTIONS as opt (opt.id)}
				<option value={opt.id}>{opt.name}</option>
			{/each}
		</select>
		<button class="btn btn-square btn-outline btn-primary btn-sm" onclick={handleSearch}>
			<Search />
		</button>
	</div>

	<div class="flex items-center gap-2">
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
</div>

<div class="mt-6 flex items-center justify-between">
	<PagecountAboveTable itemsLength={items.length} {pagination} />

	<a href={USER_ROUTES.create} class="btn btn-outline btn-primary">
		<Plus />
		Nuevo usuario
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
								field={col.key}
								currentSort={sort}
								onSortChange={(newSort) =>
									applyFilterPatch({ sort: newSort.field, order: newSort.order })}
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
							<p class="text-base-content/50">No se encontraron usuarios</p>
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
											Ver
										</a>
									</li>
									<li>
										<a href={buildUrlWithFilters(USER_ROUTES.edit(item.id), page.url.searchParams)}
											>Editar</a
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
