<script lang="ts">
	/**
	 * FREE_TOUR drafts list — activities in DRAFT status waiting to be promoted
	 * to an aggregation via "Crear agrupación".
	 */
	import * as m from '$paraglide/messages';
	import type { PageProps } from './$types';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import type { FiltersSchema, PatchValue } from '$lib/utils/filters';
	import { createPageField, patchFilters } from '$lib/utils/filters';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { ACTIVITY_ROUTES } from '$lib/config/routes/backoffice/activities';
	import { FREE_TOUR_ROUTES } from '$lib/config/routes/backoffice/freeTours';
	import { ActivityStatus } from '$core/activities/enums';
	import { ACTIVITY_STATUS_OPTIONS } from '$lib/labels/activities';

	import Pagination from '$lib/components/backoffice/MeltPagination.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';
	import FreeToursListTabNav from '../components/FreeToursListTabNav.svelte';
	import { Add, GalleryMinimalistic, Magnifier } from '$lib/icons/Linear';

	type DraftsFilters = { page: number; q?: string };

	const draftsFiltersSchema: FiltersSchema<DraftsFilters> = {
		fields: {
			page: createPageField(),
			q: {
				parse: (raw) => raw || undefined,
				serialize: (value, out) => {
					if (value) out.set('q', value);
					else out.delete('q');
				},
				resetPageOnChange: true
			}
		}
	};

	let { data }: PageProps = $props();

	const items = $derived(data.items);
	const pagination = $derived(data.pagination);
	const filters = $derived(data.filters);
	const pageSize = $derived(pagination?.pageSize ?? 20);
	const total = $derived(pagination?.total ?? 0);

	let searchQuery = $derived(filters.q || '');

	function applyFilterPatch(patch: { [K in keyof DraftsFilters]?: PatchValue<DraftsFilters[K]> }) {
		const newParams = patchFilters(draftsFiltersSchema, page.url.searchParams, patch);
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
	<title>{m.freeTours_draftsListPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.freeTours_draftsListTitle()} breadcrumbs={data.breadcrumbs} />

<FreeToursListTabNav />

<div class="border-base-300 bg-base-100 rounded-b-lg border border-t-0 p-6">
	<!-- Filters Bar -->
	<div class="bnd-filter-bar card flex-row items-center gap-6 p-2">
		<div class="flex w-full items-center gap-2">
			<input
				type="text"
				placeholder={m.freeTours_draftsSearchPlaceholder()}
				class="input-bordered input w-full"
				bind:value={searchQuery}
				onkeydown={(e) => e.key === 'Enter' && handleSearch()}
			/>
			<button class="btn btn-square btn-outline btn-primary" onclick={handleSearch}>
				<Magnifier class="size-5" />
			</button>
		</div>

		<a href={FREE_TOUR_ROUTES.create} class="btn btn-outline btn-primary ml-auto">
			<Add class="size-5" />
			{m.freeTours_newResource()}
		</a>
	</div>

	<!-- Table -->
	<div class="card mt-6">
		<table class="table-zebra table-sm table">
			<thead>
				<tr>
					<th>
						<span>{m.freeTours_columnTitle()}</span>
					</th>
					<th>
						<span>{m.freeTours_columnStatus()}</span>
					</th>
					<th class="w-0"></th>
				</tr>
			</thead>
			<tbody>
				{#if items.length === 0}
					<tr>
						<td colspan="3" class="text-center">
							<div class="py-8">
								<p class="text-base-content/50">{m.freeTours_draftsEmptyState()}</p>
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
											href={buildUrlWithFilters(
												ACTIVITY_ROUTES.edit(item.id),
												page.url.searchParams
											)}
											class="font-medium"
										>
											{item.title}
										</a>
										<p class="text-base-content/50 text-xs">{item.slug}</p>
									</div>
								</div>
							</td>
							<td>
								{#if item.status === ActivityStatus.PENDING_GROUP}
									<span class="badge badge-success badge-sm">
										{ACTIVITY_STATUS_OPTIONS.find((o) => o.id === item.status)?.name ?? item.status}
									</span>
								{:else}
									<span class="badge badge-warning badge-sm">
										{ACTIVITY_STATUS_OPTIONS.find((o) => o.id === item.status)?.name ?? item.status}
									</span>
								{/if}
							</td>
							<td class="w-0 text-right">
								<div class="dropdown dropdown-end dropdown-bottom">
									<div tabindex="0" role="button" class="text-bold btn btn-sm m-1">&#8942;</div>
									<ul tabindex="-1" class="dropdown-content menu">
										<li>
											<a
												href={buildUrlWithFilters(
													ACTIVITY_ROUTES.edit(item.id),
													page.url.searchParams
												)}
											>
												{m.freeTours_editButton()}
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
</div>
