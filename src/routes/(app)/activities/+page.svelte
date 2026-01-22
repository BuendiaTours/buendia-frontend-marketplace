<script lang="ts">
	// ============================================================================
	// IMPORTS
	// ============================================================================

	// Types
	import type { ActivityListItem, Column, Location } from '$lib/types';
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
	import { patchFilters, clearFilters, hasActiveFilters } from '$lib/utils/filters';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { activitiesFiltersSchema } from './filters.schema';
	import { CalendarDate } from '@internationalized/date';

	// Actions
	import { checkAll } from '$lib/actions/checkAll';
	import { confirmAction } from '$lib/actions/confirmAction';

	// Components
	import Pagination from '$lib/components/MeltPagination.svelte';
	import MeltComboBox from '$lib/components/MeltComboBox.svelte';
	import RangeCalendar from '$lib/components/MeltRangeCalendar.svelte';
	import StarRating from '$lib/components/StarRating.svelte';
	import { createDialog, createPopover, melt } from '@melt-ui/svelte';
	import { fade, scale } from 'svelte/transition';

	// Icons
	import {
		ArrowSeparateVertical,
		Calendar,
		Cancel,
		Check,
		FilterAlt,
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
			};
			filters: ActivitiesFilters;
			sort: { field: string; order: 'asc' | 'desc' } | null;
		};
	} = $props();

	const items = $derived(data.items);
	const pagination = $derived(data.pagination);
	const filters = $derived(data.filters);
	const sort = $derived(data.sort);
	const pageSize = $derived(pagination.pageSize);
	const total = $derived(pagination.total);

	// ============================================================================
	// LOCATIONS (cargadas desde API)
	// ============================================================================

	let locations = $state<{ value: string; label: string }[]>([]);

	onMount(async () => {
		try {
			const response = await fetch(`${PUBLIC_API_BASE_URL}/activities/locations`);
			if (response.ok) {
				const data: Location[] = await response.json();
				locations = data.map((loc) => ({
					value: loc.slug,
					label: loc.name
				}));
			}
		} catch (error) {
			console.error('Error cargando locations:', error);
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
		clearFilters($page.url.pathname, goto);
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

	let freeTourChecked = $state(filters.isFreeTour ?? false);

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
	// FILTRO: LOCATION
	// ============================================================================

	let selectedLocation = $state(filters.location);

	$effect(() => {
		selectedLocation = filters.location;
	});

	// Key para forzar recreación del ComboBox cuando se cargan las locations
	// Esto asegura que el inputDefaultValue se calcule correctamente
	const locationComboKey = $derived(`${selectedLocation}-${locations.length}`);

	function handleLocationChange(value: string | string[] | undefined) {
		const locationValue = Array.isArray(value) ? value[0] : value;
		selectedLocation = locationValue;

		applyFilterPatch({
			location: locationValue ? locationValue : (null as any)
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

	let advancedFilters = $state<Record<string, boolean>>(
		Object.fromEntries(advancedFiltersConfig.map((f) => [f.key, false]))
	);

	$effect(() => {
		advancedFiltersConfig.forEach((filter) => {
			advancedFilters[filter.key] = (filters as any)[filter.key] ?? false;
		});
	});

	const hasAdvancedFilters = $derived(Object.values(advancedFilters).some((value) => value));

	const activeAdvancedFiltersCount = $derived(
		Object.values(advancedFilters).filter((value) => value).length
	);

	function handleAdvancedFiltersApply() {
		const patch: Record<string, any> = {};
		advancedFiltersConfig.forEach((filter) => {
			patch[filter.key] = advancedFilters[filter.key] || (null as any);
		});
		applyFilterPatch(patch);
		advancedFiltersOpenState.set(false);
	}

	function handleClearAdvancedFilters() {
		const patch: Record<string, any> = {};
		advancedFiltersConfig.forEach((filter) => {
			patch[filter.key] = null as any;
		});
		applyFilterPatch(patch);
	}

	// Dialog de Melt-UI para filtros avanzados
	const {
		elements: {
			trigger: advancedFiltersTrigger,
			overlay: advancedFiltersOverlay,
			content: advancedFiltersContent,
			title: advancedFiltersTitle,
			description: advancedFiltersDescription,
			close: advancedFiltersClose,
			portalled: advancedFiltersPortalled
		},
		states: { open: advancedFiltersOpenState }
	} = createDialog({
		forceVisible: true
	});

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
		{ key: 'title', title: 'Título', sortable: true },
		{ key: 'location', title: 'Ubicación', sortable: true },
		{ key: 'rating', title: 'Valoración', sortable: true },
		{ key: 'isFreeTour', title: 'Free Tour', sortable: true }
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
				sort: columnKey as 'title' | 'location' | 'rating' | 'isFreeTour',
				order: 'asc'
			});
		}
	}

	function handleResetSort() {
		applyFilterPatch({
			sort: null as any,
			order: null as any
		});
	}
</script>

<h1 class="text-lg">Actividades</h1>

<div
	class="bnd-filter-bar mt-6 flex items-center gap-8 rounded-box border border-base-content/9 bg-base-100 p-2"
>
	<div class="tooltip" data-tip={dateRangeTooltip}>
		<button use:melt={$dateRangeTrigger} class="btn btn-square">
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
				items={locations}
				placeholder="Filter by locations"
				name="filterLocation"
				icon={Map}
				type="single"
				bind:value={selectedLocation}
				onValueChange={handleLocationChange}
			/>
		{/key}
		<div class="tooltip" data-tip="Limpia la localización">
			<button
				class="btn btn-square btn-soft btn-md btn-error"
				onclick={handleClearLocation}
				disabled={!selectedLocation}
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
		<div
			class="tooltip"
			data-tip={hasAdvancedFilters
				? `Filtros avanzados (${activeAdvancedFiltersCount})`
				: 'Filtros avanzados'}
		>
			<button use:melt={$advancedFiltersTrigger} class="btn btn-square">
				<FilterAlt class={hasAdvancedFilters ? 'text-success' : 'text-base-content/60'} />
			</button>
		</div>

		{#if $advancedFiltersOpenState}
			<div use:melt={$advancedFiltersPortalled}>
				<div
					use:melt={$advancedFiltersOverlay}
					class="fixed inset-0 z-50 bg-black/60"
					transition:fade={{ duration: 150 }}
				></div>
				<div
					use:melt={$advancedFiltersContent}
					class="fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-box border border-base-content/10 bg-base-100 p-6 shadow-xl"
					transition:scale={{ duration: 150, start: 0.95 }}
				>
					<div class="mb-4 flex items-start justify-between">
						<h2 use:melt={$advancedFiltersTitle} class="text-xl font-semibold">
							Filtros avanzados
						</h2>
						<button
							use:melt={$advancedFiltersClose}
							class="btn -mt-4 -mr-4 btn-square btn-ghost btn-sm"
						>
							<Cancel />
						</button>
					</div>

					<p use:melt={$advancedFiltersDescription} class="mb-6 text-sm text-base-content/70">
						Selecciona las características adicionales que deseas filtrar
					</p>

					<div class="space-y-4">
						{#each advancedFiltersConfig as filter}
							<label class="flex cursor-pointer items-center gap-3">
								<input
									type="checkbox"
									class="checkbox checkbox-sm"
									bind:checked={advancedFilters[filter.key]}
								/>
								<span class="label-text">{filter.label}</span>
							</label>
						{/each}
					</div>

					<div class="mt-6 flex gap-2">
						<button
							class="btn btn-soft btn-error"
							onclick={handleClearAdvancedFilters}
							disabled={!hasAdvancedFilters}
						>
							Limpiar filtros
						</button>
						<button use:melt={$advancedFiltersClose} class="btn ml-auto btn-ghost">
							Cancelar
						</button>
						<button class="btn btn-outline btn-primary" onclick={handleAdvancedFiltersApply}>
							Aplicar filtros
						</button>
					</div>
				</div>
			</div>
		{/if}

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
	{#if items.length}
		<div class="pagenav-info text-sm text-base-content/70">
			Página {pagination.page} de {pagination.totalPages}, mostrando los elementos del {(pagination.page -
				1) *
				pagination.pageSize +
				1} al {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total}
		</div>
	{/if}
	<button class="btn btn-outline btn-primary">
		<Plus />
		<span>Nueva actividad</span>
	</button>
</div>

{#if items.length}
	<div class="mt-6 rounded-box border border-base-content/9 bg-base-100">
		<table class="table table-zebra table-sm">
			<thead>
				<tr>
					<th><input type="checkbox" class="checkbox checkbox-sm" use:checkAll /></th>
					<th>Id</th>
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
					<th>
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
						<td>
							<div class="tooltip" data-tip={item.id}>
								<span class="block max-w-[48px] truncate">{item.id}</span>
							</div>
						</td>
						{#each columns as col}
							{#if col.key === 'title'}
								<td>
									<a href={buildUrlWithFilters(`/activities/${item.slug}`, $page.url.searchParams)}>
										{item[col.key]}
									</a>
								</td>
							{:else if col.key === 'rating'}
								<td>
									<div class="flex items-center gap-2">
										<StarRating value={item.rating} />
										{#if item.rating !== null}
											<span class="text-xs">{item.rating.toFixed(1)}</span>
										{/if}
									</div>
								</td>
							{:else if col.key === 'isFreeTour'}
								<td>
									{#if item.isFreeTour === 1}
										<Check class="mx-auto" />
									{/if}
								</td>
							{:else}
								<td>
									{item[col.key]}
								</td>
							{/if}
						{/each}
						<td
							><div class="dropdown dropdown-end dropdown-bottom ml-auto">
								<div tabindex="0" role="button" class="btn m-1 btn-sm">Actions</div>
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
													message: '¿Seguro que quieres eliminar este elemento?',
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

	<Pagination count={total} perPage={pageSize} onPageChange={handlePageChange} />
{:else}
	<p class="text-md mt-6 text-base-content/70">No hay actividades disponibles.</p>
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
