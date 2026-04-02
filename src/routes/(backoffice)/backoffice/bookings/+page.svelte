<script lang="ts">
	/**
	 * Bookings list page.
	 * Displays a filterable, sortable, paginated table of bookings (view-only).
	 */
	import * as m from '$paraglide/messages';
	import type { PageProps } from './$types';
	import type { BookingsFilters } from './schemas/filters.schema';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import type { PatchValue } from '$lib/utils/filters';
	import { patchFilters } from '$lib/utils/filters';
	import { bookingsFiltersSchema } from './schemas/filters.schema';
	import { BOOKING_STATUS_OPTIONS, PAYMENT_METHOD_OPTIONS } from '$lib/labels/bookings';
	import { BOOKING_ROUTES } from '$lib/config/routes/backoffice/bookings';
	import { buildUrlWithFilters } from '$lib/utils/url';

	import Pagination from '$lib/components/backoffice/MeltPagination.svelte';
	import FilterSelect from '$lib/components/backoffice/filters/FilterSelect.svelte';
	import TableSortableHeader from '$lib/components/backoffice/tables/TableSortableHeader.svelte';
	import TableResetSort from '$lib/components/backoffice/tables/TableResetSort.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';
	import { Magnifier } from '$lib/icons/Linear';

	let { data }: PageProps = $props();

	const items = $derived(data.items);
	const pagination = $derived(data.pagination);
	const filters = $derived(data.filters as BookingsFilters);
	const sort = $derived(data.sort);
	const pageSize = $derived(pagination?.pageSize ?? 10);
	const total = $derived(pagination?.total ?? 0);

	let searchQuery = $derived(filters.q || '');

	function applyFilterPatch(patch: {
		[K in keyof BookingsFilters]?: PatchValue<BookingsFilters[K]>;
	}) {
		const currentParams = page.url.searchParams;
		const newParams = patchFilters(bookingsFiltersSchema, currentParams, patch);
		goto(`?${newParams.toString()}`, { keepFocus: true, noScroll: true });
	}

	function handleSearch() {
		applyFilterPatch({ q: searchQuery || null });
	}

	function handleFilterChange(filterKey: string, value: string | null) {
		applyFilterPatch({
			[filterKey]: value
		});
	}

	function handlePageChange(newPage: number) {
		applyFilterPatch({ page: newPage });
	}

	function formatPrice(cents: number): string {
		return (cents / 100).toFixed(2) + ' €';
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('es-ES', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	function getStatusClass(status: string): string {
		switch (status) {
			case 'CONFIRMED':
				return 'status-success';
			case 'PENDING':
				return 'status-warning';
			case 'RETRYING':
				return 'status-warning';
			case 'FAILED':
				return 'status-error';
			case 'CANCELLED':
				return 'status-neutral';
			case 'EXPIRED':
				return 'status-neutral';
			default:
				return 'status-neutral';
		}
	}
</script>

<svelte:head>
	<title>{m.bookings_listPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.bookings_listTitle()} breadcrumbs={data.breadcrumbs} />

<!-- Filters Bar -->
<div class="bnd-filter-bar card flex-row items-center gap-6 p-2">
	<div class="flex w-full items-center gap-2">
		<input
			type="text"
			placeholder={m.bookings_searchPlaceholder()}
			class="input-bordered input w-full"
			bind:value={searchQuery}
			onkeydown={(e) => e.key === 'Enter' && handleSearch()}
		/>
		<button class="btn btn-square btn-outline btn-primary" onclick={handleSearch}>
			<Magnifier class="size-5" />
		</button>
	</div>

	<FilterSelect
		options={BOOKING_STATUS_OPTIONS}
		filterKey="status"
		currentValue={filters.status}
		placeholder={m.bookings_filterStatusPlaceholder()}
		clearTooltip={m.bookings_filterStatusClear()}
		onFilterChange={handleFilterChange}
	/>
</div>

<!-- Table -->
<div class="card mt-6">
	<table class="table-zebra table-sm table">
		<thead>
			<tr>
				<th>
					<span>{m.bookings_columnLegibleId()}</span>
				</th>
				<th>
					<span>{m.bookings_columnContact()}</span>
				</th>
				<th>
					<TableSortableHeader
						title={m.bookings_columnDate()}
						field="ACTIVITY_DATETIME"
						currentSort={sort}
						onSortChange={(newSort) =>
							applyFilterPatch({
								sort: newSort.field as BookingsFilters['sort'],
								order: newSort.order
							})}
					/>
				</th>
				<th>
					<span>{m.bookings_columnSystem()}</span>
				</th>
				<th>
					<span>{m.bookings_columnPrice()}</span>
				</th>
				<th>
					<span>{m.bookings_columnPayment()}</span>
				</th>
				<th>
					<span>{m.bookings_columnStatus()}</span>
				</th>
				<th class="w-0">
					<TableResetSort currentSort={sort} />
				</th>
			</tr>
		</thead>
		<tbody>
			{#if items.length === 0}
				<tr>
					<td colspan="8" class="text-center">
						<div class="py-8">
							<p class="text-base-content/50">{m.bookings_emptyState()}</p>
						</div>
					</td>
				</tr>
			{:else}
				{#each items as item (item.id)}
					<tr>
						<td>
							<a
								href={buildUrlWithFilters(BOOKING_ROUTES.detail(item.id), page.url.searchParams)}
								class="link"
							>
								{item.legibleId}
							</a>
						</td>
						<td>
							{#if item.orderContactName}
								<p class="text-sm">{item.orderContactName}</p>
							{/if}
							{#if item.orderContactEmail}
								<p class="text-base-content/50 text-xs">{item.orderContactEmail}</p>
							{/if}
						</td>
						<td>
							<p>{formatDate(item.date)}</p>
							<p class="text-base-content/50 text-xs">{item.startTime}</p>
						</td>
						<td>
							<span class="badge badge-outline badge-sm">{item.bookingSystem}</span>
						</td>
						<td>
							{formatPrice(item.subtotalPrice)}
						</td>
						<td>
							{#if item.payment}
								<p class="text-sm">
									{PAYMENT_METHOD_OPTIONS.find((o) => o.id === item.payment?.paymentMethod)?.name ??
										item.payment.paymentMethod}
								</p>
								{#if item.payment.cardBrand && item.payment.last4}
									<p class="text-base-content/50 text-xs">
										{item.payment.cardBrand} •••• {item.payment.last4}
									</p>
								{/if}
							{:else}
								<span class="text-base-content/30 text-xs">{m.bookings_labelNoPayment()}</span>
							{/if}
						</td>
						<td>
							<div
								aria-label="status"
								class="status status-lg {getStatusClass(item.status)} mr-1"
							></div>
							<span
								>{BOOKING_STATUS_OPTIONS.find((o) => o.id === item.status)?.name ??
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
												BOOKING_ROUTES.detail(item.id),
												page.url.searchParams
											)}
										>
											{m.bookings_viewDetail()}
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
