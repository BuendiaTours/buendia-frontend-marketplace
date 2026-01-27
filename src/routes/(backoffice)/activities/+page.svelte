<script lang="ts">
	// ============================================================================
	// IMPORTS
	// ============================================================================

	// Types
	import type { ActivityListItem, Column, Destination } from '$lib/types';
	import type { ActivitiesFilters } from './filters.schema';
	import type { CreateRangeCalendarProps } from '@melt-ui/svelte';
	type DateRange = CreateRangeCalendarProps['defaultValue'];

	// SvelteKit
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	// Environment
	import { PUBLIC_API_BASE_URL } from '$env/static/public';

	// Utils
	import { patchFilters, clearAllFilters, resetSort, hasActiveFilters } from '$lib/utils/filters';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { activitiesFiltersSchema } from './filters.schema';
	import { CalendarDate } from '@internationalized/date';

	// i18n
	import * as m from '$paraglide/messages';

	// Actions
	import { checkAll } from '$lib/actions/checkAll';
	import { confirmAction } from '$lib/actions/confirmAction';

	// Components
	import Pagination from '$lib/components/MeltPagination.svelte';
	import MeltComboBox from '$lib/components/MeltComboBox.svelte';
	import RangeCalendar from '$lib/components/MeltRangeCalendar.svelte';
	import FilterAdvancedDialog from '$lib/components/filters/FilterAdvancedDialog.svelte';
	import PagecountAboveTable from '$lib/layout/partials/PagecountAboveTable.svelte';
	import { createPopover, melt } from '@melt-ui/svelte';
	import { fade, scale } from 'svelte/transition';

	// Icons
	import {
		ArrowSeparateVertical,
		Calendar,
		Cancel,
		Check,
		Map,
		NavArrowDown,
		NavArrowUp,
		Plus
	} from 'svelte-iconoir';

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
			sort: { field: string; order: 'asc' | 'desc' } | null;
		};
	} = $props();

	const items = $derived(data.items);
	const pagination = $derived(data.pagination);
	const filters = $derived(data.filters);
	const sort = $derived(data.sort);
	const pageSize = $derived(pagination?.pageSize ?? 10);
	const total = $derived(pagination?.total ?? 0);

	// ============================================================================
	// DESTINATIONS (cargadas desde API)
	// ============================================================================

	let destinations = $state<{ value: string; label: string }[]>([]);

	onMount(async () => {
		try {
			const response = await fetch(`${PUBLIC_API_BASE_URL}/destinations`);
			if (response.ok) {
				const json = await response.json();
				const data: Destination[] = json.data || json;
				destinations = data.map((loc) => ({
					value: loc.slug,
					label: loc.name
				}));
			}
		} catch (error) {
			console.error('Error cargando destinations:', error);
		}
	});

	// ============================================================================
	// HELPERS GENERALES
	// ============================================================================

	function applyFilterPatch(patch: Partial<ActivitiesFilters>) {
		const currentParams = $page.url.searchParams;
		const newParams = patchFilters(activitiesFiltersSchema, currentParams, patch);
		goto(`?${newParams.toString()}`, {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	}

	const hasFilters = $derived(hasActiveFilters(filters));

	function handleClearFilters() {
		clearAllFilters($page.url.pathname, $page.url.searchParams, goto);
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
				from: null as any,
				to: null as any
			});
		}
	}

	function handleClearDateRange() {
		handleDateRangeChange(undefined);
	}

	function setDateRangePreset(preset: 'today' | 'thisWeek' | 'next15Days') {
		const today = new Date();
		let start: Date;
		let end: Date;

		switch (preset) {
			case 'today':
				start = today;
				end = today;
				break;
			case 'thisWeek':
				const dayOfWeek = today.getDay();
				const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
				start = new Date(today);
				start.setDate(today.getDate() + diff);
				end = new Date(start);
				end.setDate(start.getDate() + 6);
				break;
			case 'next15Days':
				start = today;
				end = new Date(today);
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

	let freeTourChecked = $state(false);

	$effect(() => {
		freeTourChecked = filters.isFreeTour ?? false;
	});

	function handleFreeTourChange(event: Event) {
		const target = event.target as HTMLInputElement;
		freeTourChecked = target.checked;

		applyFilterPatch({
			isFreeTour: (freeTourChecked ? true : null) as any
		});
	}

	// ============================================================================
	// FILTRO: DESTINATION
	// ============================================================================

	let selectedDestination = $state<string | undefined>(undefined);

	$effect(() => {
		selectedDestination = filters.destination;
	});

	// Key para forzar recreación del ComboBox cuando se cargan las locations
	// Esto asegura que el inputDefaultValue se calcule correctamente
	const locationComboKey = $derived(`${selectedDestination}-${destinations.length}`);

	function handleLocationChange(value: string | string[] | undefined) {
		const locationValue = Array.isArray(value) ? value[0] : value;
		selectedDestination = locationValue;

		applyFilterPatch({
			destination: locationValue ? locationValue : (null as any)
		});
	}

	function handleClearLocation() {
		handleLocationChange(undefined);
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
		Object.fromEntries(advancedFiltersConfig.map((f) => [f.key, (filters as any)[f.key] ?? false]))
	);

	function handleAdvancedFiltersApply(appliedFilters: Record<string, boolean>) {
		const patch: Record<string, any> = {};
		advancedFiltersConfig.forEach((filter) => {
			patch[filter.key] = appliedFilters[filter.key] || (null as any);
		});
		applyFilterPatch(patch);
	}

	function handleClearAdvancedFilters() {
		const patch: Record<string, any> = {};
		advancedFiltersConfig.forEach((filter) => {
			patch[filter.key] = null as any;
		});
		applyFilterPatch(patch);
	}

	// Popover de Melt-UI para filtro de fechas
	const {
		elements: {
			trigger: dateRangeTrigger,
			content: dateRangeContent,
			arrow: dateRangeArrow,
			close: dateRangeClose
		},
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

	function handleSort(columnKey: keyof ActivityListItem) {
		const currentSort = filters.sort;
		const currentOrder = filters.order || 'asc';

		if (currentSort === columnKey) {
			applyFilterPatch({
				order: currentOrder === 'asc' ? 'desc' : 'asc'
			});
		} else {
			applyFilterPatch({
				sort: columnKey as 'codeRef' | 'title' | 'status' | 'kind',
				order: 'asc'
			});
		}
	}

	function handleResetSort() {
		resetSort($page.url.pathname, $page.url.searchParams, goto);
	}
</script>

<svelte:head>
	<title>Actividades - Backoffice</title>
</svelte:head>

<h1 class="text-lg">Actividades</h1>

<!-- Filters Bar -->
<div
	class="bnd-filter-bar mt-6 flex items-center gap-8 rounded-box border border-base-content/9 bg-base-100 p-2"
>
	<div class="tooltip" data-tip={dateRangeTooltip}>
		<button
			use:melt={$dateRangeTrigger}
			class="btn btn-square btn-soft"
			class:border-success={hasDateRange}
		>
			<Calendar class={hasDateRange ? 'text-success' : 'text-base-content/70'} />
		</button>
	</div>

	{#if $dateRangePopoverOpen}
		<div
			use:melt={$dateRangeContent}
			transition:fade={{ duration: 100 }}
			class="z-50 rounded-box border border-base-content/10 bg-base-100 p-4 shadow-lg"
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
						class="btn ml-auto btn-soft btn-xs btn-error"
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
		<div class="tooltip" data-tip="Limpia la destination">
			<button
				class="btn btn-square btn-soft btn-md btn-error"
				onclick={handleClearLocation}
				disabled={!selectedDestination}
			>
				<Cancel />
			</button>
		</div>
	</div>

	<select class="select">
		<option disabled selected>Pick a font</option>
		<option>Inter</option>
		<option>Poppins</option>
		<option>Raleway</option>
	</select>

	<div class="ml-auto flex items-center gap-2">
		<FilterAdvancedDialog
			filters={advancedFiltersConfig}
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
				<Cancel />
			</button>
		</div>
	</div>
</div>

<!-- Results Info -->
<div class="mt-6 flex items-center justify-between">
	<PagecountAboveTable itemsLength={items.length} {pagination} />

	<button class="btn btn-outline btn-primary">
		<Plus />
		<span>{m.activities_newActivity()}</span>
	</button>
</div>

{#if items.length}
	<div class="mt-6 rounded-box border border-base-content/9 bg-base-100">
		<table class="table table-zebra table-sm">
			<thead>
				<tr>
					<th><input type="checkbox" class="checkbox checkbox-sm" use:checkAll /></th>
					{#each columns as col}
						<th>
							{#if col.sortable}
								<button
									type="button"
									class="btn cursor-pointer pr-2 btn-ghost btn-sm"
									onclick={() => handleSort(col.key)}
								>
									<span class:text-success={sort?.field === col.key}>{col.title}</span>

									{#if sort?.field === col.key}
										{#if sort.order === 'desc'}
											<NavArrowDown class="text-success" />
										{:else}
											<NavArrowUp class="text-success" />
										{/if}
									{:else}
										<ArrowSeparateVertical class="text-base-content/30" />
									{/if}
								</button>
							{:else}
								<span>{col.title}</span>
							{/if}
						</th>
					{/each}
					<th class="w-0">
						{#if sort}
							<button class="btn btn-soft btn-sm btn-error" onclick={handleResetSort}
								>Reset sort</button
							>
						{/if}
					</th>
				</tr>
			</thead>

			<tbody>
				{#each items as item}
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
						{#each columns as col}
							{#if col.key === 'id'}
								<td>
									<div class="tooltip" data-tip={item.id}>
										<span class="block max-w-[48px] truncate">{item.id}</span>
									</div>
								</td>
							{:else if col.key === 'title'}
								<td>
									<a href={buildUrlWithFilters(`/activities/${item.slug}`, $page.url.searchParams)}>
										{item[col.key]}
									</a>
								</td>
							{:else if col.key === 'destinations'}
								<td>
									{item[col.key].map((d: any) => d.name).join(', ')}
								</td>
							{:else}
								<td>
									{item[col.key]}
								</td>
							{/if}
						{/each}
						<td class="w-0 text-right">
							<div class="dropdown dropdown-end dropdown-bottom">
								<div tabindex="0" role="button" class="text-bold btn m-1 btn-sm">⋮</div>
								<ul
									tabindex="-1"
									class="dropdown-content menu z-1 w-52 rounded-box bg-base-100 p-2 shadow-sm"
								>
									<li>
										<a
											href={buildUrlWithFilters(`/activities/${item.slug}`, $page.url.searchParams)}
										>
											View
										</a>
									</li>
									<li>
										<a
											href={buildUrlWithFilters(
												`/activities/${item.slug}/edit`,
												$page.url.searchParams
											)}
										>
											Edit
										</a>
									</li>
									<li>
										<form
											method="POST"
											action={buildUrlWithFilters(
												`/activities/${item.slug}/delete`,
												$page.url.searchParams
											)}
										>
											<button
												type="submit"
												class="w-full text-left"
												use:confirmAction={{
													title: 'Eliminar',
													message: '¿Estás seguro de que quieres eliminar este elemento?',
													confirmText: 'Eliminar',
													cancelText: 'Cancelar',
													danger: true
												}}
											>
												Delete
											</button>
										</form>
									</li>
								</ul>
							</div></td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<p class="text-md mt-6 text-base-content/70">No hay actividades disponibles.</p>
{/if}

<!-- Pagination -->
{#if data.pagination}
	<div class="mt-4">
		<Pagination count={total} perPage={pageSize} onPageChange={handlePageChange} />
	</div>
{/if}

<style>
	.arrow {
		position: absolute;
		background-color: hsl(var(--b1));
		width: 10px;
		height: 10px;
		transform: rotate(45deg);
		border-top: 1px solid hsl(var(--bc) / 0.1);
		border-left: 1px solid hsl(var(--bc) / 0.1);
		z-index: -1;
	}
</style>
