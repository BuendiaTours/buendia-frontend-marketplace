<script lang="ts">
	// Types
	import type { ActivityListItem, Column, Destination } from '$lib/types';
	import type { CriteriaSortOption } from '$core/_shared/enums';
	import type { ActivitiesFilters } from './schemas/filters.schema';
	import type { CreateRangeCalendarProps } from '@melt-ui/svelte';
	type DateRange = CreateRangeCalendarProps['defaultValue'];

	// SvelteKit
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	// Environment
	import { PUBLIC_API_BASE_URL } from '$env/static/public';

	// Utils
	import type { PatchValue } from '$lib/utils/filters';
	import { patchFilters, clearAllFilters, hasActiveFilters } from '$lib/utils/filters';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { activitiesFiltersSchema } from './schemas/filters.schema';
	import { CalendarDate } from '@internationalized/date';
	import { SvelteDate } from 'svelte/reactivity';

	// Routes
	import { ACTIVITY_ROUTES } from '$lib/config/routes/backoffice/activities';

	// i18n
	import * as m from '$paraglide/messages';

	// Enums
	import { ACTIVITY_KIND_OPTIONS, ACTIVITY_STATUS_OPTIONS } from '$lib/labels/activities';

	// Actions
	import { checkAll } from '$lib/actions/backoffice/checkAll';
	import { confirmAction } from '$lib/actions/backoffice/confirmAction';

	// Components
	import Pagination from '$lib/components/backoffice/MeltPagination.svelte';
	import MeltComboBox from '$lib/components/backoffice/MeltComboBox.svelte';
	import RangeCalendar from '$lib/components/backoffice/MeltRangeCalendar.svelte';
	import FilterAdvancedDialog from '$lib/components/backoffice/filters/FilterAdvancedDialog.svelte';
	import TableSortableHeader from '$lib/components/backoffice/tables/TableSortableHeader.svelte';
	import TableResetSort from '$lib/components/backoffice/tables/TableResetSort.svelte';
	import PagecountAboveTable from '$lib/layout/backoffice/partials/PagecountAboveTable.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';
	import { createPopover, melt } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';

	// MeltDrawerManager - Gestiona drawers dinámicos con animaciones
	import MeltDrawerManager from '$lib/components/backoffice/MeltDrawerManager.svelte';
	let selectedActivityId = $state<string | null>(null);

	// Icons
	import { Calendar, Close, Map, AddSquare } from '$lib/icons/Linear';

	// ============================================================================
	// PROPS & DATA
	// ============================================================================

	let {
		data
	}: {
		data: {
			items: ActivityListItem[];
			pagination: {
				page: number;
				pageSize: number;
				total: number;
				totalPages: number;
			} | null;
			filters: ActivitiesFilters;
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

	// ============================================================================
	// DESTINATIONS (cargadas desde API en cliente)
	// ============================================================================

	let destinations = $state<{ value: string; label: string }[]>([]);

	onMount(async () => {
		try {
			// Cargar destinations
			const destResponse = await fetch(`${PUBLIC_API_BASE_URL}/destinations`);
			if (destResponse.ok) {
				const json = await destResponse.json();
				const data: Destination[] = json.data || json;
				destinations = data.map((loc) => ({
					value: loc.slug,
					label: loc.name
				}));
			}
		} catch (error) {
			console.error('Error cargando destinations desde API:', error);
		}
	});

	// ============================================================================
	// HELPERS GENERALES
	// ============================================================================

	function applyFilterPatch(patch: {
		[K in keyof ActivitiesFilters]?: PatchValue<ActivitiesFilters[K]>;
	}) {
		const currentParams = page.url.searchParams;
		const newParams = patchFilters(activitiesFiltersSchema, currentParams, patch);
		goto(`?${newParams.toString()}`, {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	}

	const hasFilters = $derived(hasActiveFilters(filters));

	function handleClearFilters() {
		clearAllFilters(page.url.pathname, page.url.searchParams, goto);
	}

	// ============================================================================
	// FILTRO: RANGO DE FECHAS
	// ============================================================================

	let dateRangeFilter = $state<DateRange | undefined>();

	$effect(() => {
		if (filters.from && filters.to) {
			dateRangeFilter = {
				start: parseCalendarDate(filters.from),
				end: parseCalendarDate(filters.to)
			};
		} else {
			dateRangeFilter = undefined;
		}
	});

	const hasDateRange = $derived(
		dateRangeFilter?.start !== undefined && dateRangeFilter?.end !== undefined
	);

	const dateRangeTooltip = $derived(
		!hasDateRange || !dateRangeFilter?.start || !dateRangeFilter?.end
			? 'Selecciona rango de fechas'
			: `${dateRangeFilter.start.year}/${String(dateRangeFilter.start.month).padStart(2, '0')}/${String(dateRangeFilter.start.day).padStart(2, '0')} - ${dateRangeFilter.end.year}/${String(dateRangeFilter.end.month).padStart(2, '0')}/${String(dateRangeFilter.end.day).padStart(2, '0')}`
	);

	function parseCalendarDate(dateStr: string): CalendarDate {
		const [year, month, day] = dateStr.split('-').map(Number);
		return new CalendarDate(year, month, day);
	}

	function formatDateValue(date: { year: number; month: number; day: number }): string {
		const year = date.year;
		const month = String(date.month).padStart(2, '0');
		const day = String(date.day).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	function handleDateRangeChange(newRange: DateRange | undefined) {
		dateRangeFilter = newRange;

		if (newRange?.start && newRange?.end) {
			applyFilterPatch({
				from: formatDateValue(newRange.start),
				to: formatDateValue(newRange.end)
			});
		} else {
			applyFilterPatch({
				from: null,
				to: null
			});
		}
	}

	function handleClearDateRange() {
		handleDateRangeChange(undefined);
	}

	function setDateRangePreset(preset: 'today' | 'thisWeek' | 'next15Days') {
		const today = new SvelteDate();
		let start: Date;
		let end: Date;

		switch (preset) {
			case 'today':
				start = today;
				end = today;
				break;
			case 'thisWeek': {
				const dayOfWeek = today.getDay();
				const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
				start = new SvelteDate(today);
				start.setDate(today.getDate() + diff);
				end = new SvelteDate(start);
				end.setDate(start.getDate() + 6);
				break;
			}
			case 'next15Days':
				start = today;
				end = new SvelteDate(today);
				end.setDate(today.getDate() + 14);
				break;
		}

		handleDateRangeChange({
			start: new CalendarDate(start.getFullYear(), start.getMonth() + 1, start.getDate()),
			end: new CalendarDate(end.getFullYear(), end.getMonth() + 1, end.getDate())
		});
	}

	// ============================================================================
	// FILTRO: FREE TOUR
	// ============================================================================

	let freeTourChecked = $derived(filters.isFreeTour ?? false);

	function handleFreeTourChange(event: Event) {
		const target = event.target as HTMLInputElement;
		freeTourChecked = target.checked;

		applyFilterPatch({
			isFreeTour: freeTourChecked ? true : null
		});
	}

	// ============================================================================
	// FILTRO: DESTINATION
	// ============================================================================

	let selectedDestination = $derived(filters.destination);

	// Key para forzar recreación del ComboBox cuando se cargan las locations
	// Esto asegura que el inputDefaultValue se calcule correctamente
	const locationComboKey = $derived(`${selectedDestination}-${destinations.length}`);

	function handleLocationChange(value: string | string[] | undefined) {
		const locationValue = Array.isArray(value) ? value[0] : value;
		selectedDestination = locationValue;

		applyFilterPatch({
			destination: locationValue ? locationValue : null
		});
	}

	function handleClearLocation() {
		handleLocationChange(undefined);
	}

	// ============================================================================
	// FILTRO: KIND
	// ============================================================================

	let selectedKind = $derived(filters.kind || '');

	function handleKindChange(value: string | undefined) {
		applyFilterPatch({
			kind: value ? value : null
		});
	}

	function handleClearKind() {
		handleKindChange(undefined);
	}

	// ============================================================================
	// FILTRO: STATUS
	// ============================================================================

	let selectedStatus = $derived(filters.status || '');

	function handleStatusChange(value: string | undefined) {
		applyFilterPatch({
			status: value ? value : null
		});
	}

	function handleClearStatus() {
		handleStatusChange(undefined);
	}

	// ============================================================================
	// FILTROS AVANZADOS
	// ============================================================================

	const advancedFiltersConfig = [
		{ key: 'kidsFreeTour', label: 'Niños gratis' },
		{ key: 'breakfastIncluded', label: 'Desayuno incluido' },
		{ key: 'wheelchairAccessible', label: 'Accesible para sillas de ruedas' },
		{ key: 'audioGuideAvailable', label: 'Audioguía disponible' },
		{ key: 'photographyAllowed', label: 'Fotografía permitida' },
		{ key: 'smallGroup', label: 'Grupo pequeño (máx. 15 personas)' }
	] as const;

	// Crear objeto con los valores actuales de los filtros avanzados
	const currentAdvancedFilters = $derived(
		Object.fromEntries(advancedFiltersConfig.map((f) => [f.key, filters[f.key] ?? false]))
	);

	function handleAdvancedFiltersApply(appliedFilters: Record<string, boolean>) {
		const patch: { [K in keyof ActivitiesFilters]?: PatchValue<ActivitiesFilters[K]> } = {};
		advancedFiltersConfig.forEach((filter) => {
			patch[filter.key] = appliedFilters[filter.key] || null;
		});
		applyFilterPatch(patch);
	}

	function handleClearAdvancedFilters() {
		const patch: { [K in keyof ActivitiesFilters]?: PatchValue<ActivitiesFilters[K]> } = {};
		advancedFiltersConfig.forEach((filter) => {
			patch[filter.key] = null;
		});
		applyFilterPatch(patch);
	}

	// Popover de Melt-UI para filtro de fechas
	const {
		elements: { trigger: dateRangeTrigger, content: dateRangeContent, arrow: dateRangeArrow },
		states: { open: dateRangePopoverOpen }
	} = createPopover({
		forceVisible: true,
		positioning: {
			placement: 'bottom-start',
			gutter: 4
		}
	});

	// ============================================================================
	// TABLA Y PAGINACIÓN
	// ============================================================================

	const columns: Column<ActivityListItem>[] = [
		{ key: 'id', title: 'Id', sortable: false },
		{ key: 'codeRef', title: 'Código', sortable: false },
		{ key: 'title', title: 'Título', sortable: true },
		{ key: 'destinations', title: 'Destinos', sortable: false },
		{ key: 'status', title: 'Estado', sortable: true },
		{ key: 'kind', title: 'Tipo', sortable: true }
	];

	function handlePageChange(newPage: number) {
		applyFilterPatch({ page: newPage });
	}

	// Sort logic is now handled inside TableSortableHeader component
	// Reset sort logic is now handled inside TableResetSort component
</script>

<svelte:head>
	<title>Actividades - Backoffice</title>
</svelte:head>

<LocationBar title="Listado de actividades" breadcrumbs={data.breadcrumbs} />

<!-- Filters Bar -->
<div class="bnd-filter-bar card flex-row items-center gap-6 p-2">
	<div class="tooltip" data-tip={dateRangeTooltip}>
		<button
			use:melt={$dateRangeTrigger}
			class="btn btn-square btn-soft"
			class:!border-success={hasDateRange}
		>
			<Calendar class={`size-5 ${hasDateRange ? 'text-success' : 'text-base'}`} />
		</button>
	</div>

	{#if $dateRangePopoverOpen}
		<div
			use:melt={$dateRangeContent}
			transition:fade={{ duration: 100 }}
			class="rounded-box border-base-content/10 bg-base-100 z-50 border p-4 shadow-lg"
		>
			<div use:melt={$dateRangeArrow} class="arrow"></div>
			<div class="flex flex-col gap-2">
				<div class="flex gap-2">
					<button
						class="btn btn-outline btn-xs btn-primary"
						onclick={() => setDateRangePreset('today')}
					>
						Hoy
					</button>
					<button
						class="btn btn-outline btn-xs btn-primary"
						onclick={() => setDateRangePreset('thisWeek')}
					>
						Esta semana
					</button>
					<button
						class="btn btn-outline btn-xs btn-primary"
						onclick={() => setDateRangePreset('next15Days')}
					>
						15 días
					</button>
					<button
						disabled={!hasDateRange}
						class="btn btn-soft btn-xs btn-error ml-auto"
						onclick={handleClearDateRange}
					>
						Limpiar selección
					</button>
				</div>
				<div>
					{#key dateRangeFilter}
						<RangeCalendar
							bind:value={dateRangeFilter}
							onValueChange={handleDateRangeChange}
							numberOfMonths={2}
						/>
					{/key}
				</div>
			</div>
		</div>
	{/if}

	<label class="label">
		<input
			type="checkbox"
			class="toggle bg-base-200 toggle-success"
			bind:checked={freeTourChecked}
			onchange={handleFreeTourChange}
		/>
		<span class="text-sm select-none" class:text-success={freeTourChecked}>Free tours</span>
	</label>

	<div class="flex gap-2">
		{#key locationComboKey}
			<MeltComboBox
				items={destinations}
				placeholder="Filter by destinations"
				name="filterDestination"
				icon={Map}
				type="single"
				bind:value={selectedDestination}
				onValueChange={handleLocationChange}
			/>
		{/key}
		<div class="tooltip" data-tip="Limpia el destino">
			<button
				class="btn btn-square btn-soft btn-md btn-error"
				onclick={handleClearLocation}
				disabled={!selectedDestination}
			>
				<Close class="size-5" />
			</button>
		</div>
	</div>

	<div class="flex items-center gap-2">
		<select
			class="select"
			value={selectedKind}
			onchange={(e) => handleKindChange(e.currentTarget.value || undefined)}
		>
			<option value="">Todos los tipos</option>
			{#each ACTIVITY_KIND_OPTIONS as kind (kind.id)}
				<option value={kind.id}>{kind.name}</option>
			{/each}
		</select>
		<div class="tooltip" data-tip="Limpiar tipo">
			<button
				class="btn btn-square btn-soft btn-error"
				disabled={!selectedKind}
				onclick={handleClearKind}
			>
				<Close class="size-5" />
			</button>
		</div>
	</div>

	<div class="flex items-center gap-2">
		<select
			class="select"
			value={selectedStatus}
			onchange={(e) => handleStatusChange(e.currentTarget.value || undefined)}
		>
			<option value="">Todos los estados</option>
			{#each ACTIVITY_STATUS_OPTIONS as status (status.id)}
				<option value={status.id}>{status.name}</option>
			{/each}
		</select>

		<div class="tooltip" data-tip="Limpiar estado">
			<button
				class="btn btn-square btn-soft btn-error"
				disabled={!selectedStatus}
				onclick={handleClearStatus}
			>
				<Close class="size-5" />
			</button>
		</div>
	</div>

	<div class="ml-auto flex items-center gap-2">
		<FilterAdvancedDialog
			filters={advancedFiltersConfig}
			size={32}
			currentFilters={currentAdvancedFilters}
			onApply={handleAdvancedFiltersApply}
			onClear={handleClearAdvancedFilters}
		/>

		<div class="tooltip" data-tip="Limpiar todos los filtros">
			<button
				class="btn btn-square btn-soft btn-error"
				onclick={handleClearFilters}
				disabled={!hasFilters}
			>
				<Close class="size-5" />
			</button>
		</div>
	</div>
</div>

<!-- Results Info -->
<div class="mt-6 flex items-center justify-between">
	<PagecountAboveTable itemsLength={items.length} {pagination} />

	<a href={ACTIVITY_ROUTES.create} class="btn btn-outline btn-primary">
		<AddSquare />
		<span>{m.activities_newActivity()}</span>
	</a>
</div>

{#if items.length}
	<div class="card mt-6">
		<table class="table-zebra table-sm table">
			<thead>
				<tr>
					<th><input type="checkbox" class="checkbox checkbox-sm" use:checkAll /></th>
					{#each columns as col (col.key)}
						<th>
							{#if col.sortable}
								<TableSortableHeader
									title={col.title}
									field={col.key}
									currentSort={sort}
									onSortChange={(newSort) => {
										if (newSort.field && newSort.order) {
											applyFilterPatch({
												sort: newSort.field as 'codeRef' | 'title' | 'status' | 'kind',
												order: newSort.order
											});
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
				{#each items as item (item.id)}
					<tr>
						<td>
							<input
								type="checkbox"
								name="activities_selected[]"
								value={item.id}
								id={item.id}
								class="checkbox checkbox-sm"
							/>
						</td>
						{#each columns as col (col.key)}
							{#if col.key === 'id'}
								<td>
									<div class="tooltip" data-tip={item.id}>
										<span class="block max-w-[48px] truncate">{item.id}</span>
									</div>
								</td>
							{:else if col.key === 'title'}
								<td>
									<a
										href={buildUrlWithFilters(
											ACTIVITY_ROUTES.detail(item.slug),
											page.url.searchParams
										)}
									>
										{item[col.key]}
									</a>
								</td>
							{:else if col.key === 'destinations'}
								<td>
									{item[col.key].map((d: { id: string; name: string }) => d.name).join(', ')}
								</td>
							{:else if col.key === 'kind'}
								<td>
									{ACTIVITY_KIND_OPTIONS.find((k) => k.id === item[col.key])?.name || item[col.key]}
								</td>
							{:else if col.key === 'status'}
								<td>
									{ACTIVITY_STATUS_OPTIONS.find((s) => s.id === item[col.key])?.name ||
										item[col.key]}
								</td>
							{:else}
								<td>
									{item[col.key]}
								</td>
							{/if}
						{/each}
						<td class="w-0 text-right">
							<div class="dropdown dropdown-end dropdown-bottom">
								<div tabindex="0" role="button" class="text-bold btn btn-sm m-1">⋮</div>
								<ul tabindex="-1" class="dropdown-content menu">
									<li>
										<a
											href={buildUrlWithFilters(
												ACTIVITY_ROUTES.detail(item.slug),
												page.url.searchParams
											)}
										>
											View
										</a>
									</li>
									<li>
										<button
											class=""
											onclick={() => {
												selectedActivityId = item.id;
											}}
										>
											Ver detalles
										</button>
									</li>
									<li>
										<a
											href={buildUrlWithFilters(
												ACTIVITY_ROUTES.edit(item.slug),
												page.url.searchParams
											)}
										>
											Edit
										</a>
									</li>
									<li>
										<form
											method="POST"
											action={buildUrlWithFilters(
												ACTIVITY_ROUTES.delete(item.slug),
												page.url.searchParams
											)}
										>
											<button
												type="submit"
												class="w-full text-left"
												use:confirmAction={{
													title: 'Eliminar',
													message: '¿Estás seguro de que quieres eliminar este elemento?',
													confirmText: 'Eliminar',
													cancelText: 'Close',
													danger: true
												}}
											>
												Delete
											</button>
										</form>
									</li>
								</ul>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<p class="text-md mt-6">No hay actividades disponibles.</p>
{/if}

<!-- Pagination -->
{#if data.pagination}
	<div class="mt-4">
		<Pagination count={total} perPage={pageSize} onPageChange={handlePageChange} />
	</div>
{/if}

<MeltDrawerManager
	bind:selectedId={selectedActivityId}
	{items}
	title={(item) => `Detalles de ${item.title}`}
	config={{ side: 'right', width: 400 }}
>
	{#snippet content(item)}
		<div class="space-y-4">
			<p><strong>ID:</strong> {item.id}</p>
			<p><strong>Título:</strong> {item.title}</p>
			<p><strong>Slug:</strong> {item.slug}</p>
			<p><strong>Código:</strong> {item.codeRef}</p>
			<p><strong>Estado:</strong> {item.status}</p>
			{#if item.descriptionShort}
				<div>
					<strong>Descripción corta:</strong>
					<p class="text-sm opacity-80">{item.descriptionShort}</p>
				</div>
			{/if}
		</div>
	{/snippet}
</MeltDrawerManager>

<style>
	.arrow {
		position: absolute;
		background-color: var(--color-base-100);
		width: 10px;
		height: 10px;
		transform: rotate(45deg);
		border-top: 1px solid var(--border-color-divider);
		border-left: 1px solid var(--border-color-divider);
		z-index: -1;
	}
</style>
