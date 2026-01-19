<script lang="ts">
	import type { ActivityListItem, Column, Location } from '$lib/types';
	import type { ActivitiesFilters } from '$lib/features/activities/filters.schema';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
	import { patchFilters, clearFilters, hasActiveFilters } from '$lib/utils/filters';
	import { activitiesFiltersSchema } from '$lib/features/activities/filters.schema';
	import { CalendarDate } from '@internationalized/date';

	// Actions
	import { checkAll } from '$lib/actions/checkAll';
	import { confirmAction } from '$lib/actions/confirmAction';

	// Components
	import Pagination from '$lib/components/Pagination.svelte';
	import ComboBox from '$lib/components/ComboBox.svelte';
	import RangeCalendar from '$lib/components/RangeCalendar.svelte';
	import StarRating from '$lib/components/StarRating.svelte';
	import { Popover, type DateRange } from 'bits-ui';

	// Icons
	import { Calendar, FilterAlt, Map, Cancel, Check } from 'svelte-iconoir';

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
		};
	} = $props();

	const items = $derived(data.items);
	const pagination = $derived(data.pagination);
	const filters = $derived(data.filters);
	const pageSize = $derived(pagination.pageSize);
	const total = $derived(pagination.total);

	// Función helper para aplicar cambios de filtros
	function applyFilterPatch(patch: Partial<ActivitiesFilters>) {
		const currentParams = $page.url.searchParams;
		const newParams = patchFilters(activitiesFiltersSchema, currentParams, patch);
		goto(`?${newParams.toString()}`, {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	}

	const columns: Column<ActivityListItem>[] = [
		{ key: 'title', title: 'Título', sortable: true },
		{ key: 'location', title: 'Ubicación', sortable: true },
		{ key: 'rating', title: 'Valoración', sortable: true },
		{ key: 'isFreeTour', title: 'Free Tour', sortable: true }
	];

	function handlePageChange(newPage: number) {
		applyFilterPatch({ page: newPage });
	}

	// Helper para parsear string YYYY-MM-DD a CalendarDate
	function parseCalendarDate(dateStr: string): CalendarDate {
		const [year, month, day] = dateStr.split('-').map(Number);
		return new CalendarDate(year, month, day);
	}

	// Helper para formatear DateValue a YYYY-MM-DD
	function formatDateValue(date: { year: number; month: number; day: number }): string {
		const year = date.year;
		const month = String(date.month).padStart(2, '0');
		const day = String(date.day).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	// Estado local para el rango de fechas
	let dateRangeFilter = $state<DateRange | undefined>();

	// Sincronizar dateRangeFilter con filters de la URL
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

	function handleDateRangeChange(newRange: DateRange | undefined) {
		dateRangeFilter = newRange;

		if (newRange?.start && newRange?.end) {
			// Aplicar filtro con ambas fechas
			applyFilterPatch({
				from: formatDateValue(newRange.start),
				to: formatDateValue(newRange.end)
			});
		} else {
			// Limpiar filtro de fechas (undefined elimina el parámetro)
			applyFilterPatch({
				from: undefined,
				to: undefined
			});
		}
	}

	// Estado reactivo para isFreeTour toggle
	let freeTourChecked = $state(filters.isFreeTour ?? false);

	// Sincronizar freeTourChecked con filters
	$effect(() => {
		freeTourChecked = filters.isFreeTour ?? false;
	});

	function handleFreeTourChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const checked = target.checked;
		freeTourChecked = checked;

		applyFilterPatch({
			isFreeTour: (checked ? true : null) as any
		});
	}

	// Estado reactivo para location
	let selectedLocation = $state(filters.location);

	// Sincronizar selectedLocation con filters
	$effect(() => {
		selectedLocation = filters.location;
	});

	function handleLocationChange(value: string | string[] | undefined) {
		// Para type='single', value será string | undefined
		const locationValue = Array.isArray(value) ? value[0] : value;
		selectedLocation = locationValue;

		applyFilterPatch({
			location: locationValue || undefined
		});
	}

	function handleSort(columnKey: keyof ActivityListItem) {
		console.log('🔄 Ordenar por:', columnKey);
		// TODO: Implementar lógica de ordenamiento
	}

	// Detectar si hay filtros activos (más allá de page y pageSize)
	const hasFilters = $derived(hasActiveFilters(filters));

	// Limpiar todos los filtros y volver a valores por defecto
	function handleClearFilters() {
		clearFilters($page.url.pathname, goto);
	}
</script>

<h1 class="text-lg">Actividades</h1>

<div
	class="bnd-filter-bar mt-6 flex items-center gap-8 rounded-box border border-base-content/9 bg-base-100 p-2"
>
	<div class="tooltip" data-tip="Selecciona rango de fechas">
		<Popover.Root>
			<Popover.Trigger class="btn btn-square">
				<Calendar />
			</Popover.Trigger>
			<Popover.Content
				side="bottom"
				align="start"
				alignOffset={-10}
				class="z-50 mt-1 rounded-box border border-base-content/10 bg-base-100 p-4 shadow-lg"
			>
				<RangeCalendar
					bind:value={dateRangeFilter}
					onValueChange={handleDateRangeChange}
					numberOfMonths={2}
				/>
			</Popover.Content>
		</Popover.Root>
	</div>

	<label class="label">
		<input
			type="checkbox"
			class="toggle bg-base-200"
			bind:checked={freeTourChecked}
			onchange={handleFreeTourChange}
		/>
		<span class="text-sm">Free tours</span>
	</label>

	<ComboBox
		items={locations}
		placeholder="Filter by locations"
		name="filterLocation"
		icon={Map}
		type="single"
		bind:value={selectedLocation}
		onValueChange={handleLocationChange}
	/>

	<select class="select">
		<option disabled selected>Pick a font</option>
		<option>Inter</option>
		<option>Poppins</option>
		<option>Raleway</option>
	</select>

	<div class="ml-auto flex items-center gap-2">
		<div class="tooltip" data-tip="Filtros avanzados">
			<button class="btn btn-square">
				<FilterAlt />
			</button>
		</div>

		<div class="tooltip" data-tip="Limpiar filtros">
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

{#if items.length}
	<div class="mt-6 text-sm text-base-content/70">
		Página {pagination.page} de {pagination.totalPages}, mostrando los elementos del {(pagination.page -
			1) *
			pagination.pageSize +
			1} al {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total}
	</div>

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
									class="btn cursor-pointer btn-ghost"
									onclick={() => handleSort(col.key)}
								>
									{col.title}
								</button>
							{:else}
								<span>{col.title}</span>
							{/if}
						</th>
					{/each}
					<th>Actions</th>
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
							{item.id}
						</td>
						{#each columns as col}
							{#if col.key === 'title'}
								<td>
									<a href={`/activities/${item.slug}`}>
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
							><div class="dropdown dropdown-end dropdown-bottom">
								<div tabindex="0" role="button" class="btn m-1">Actions</div>
								<ul
									tabindex="-1"
									class="dropdown-content menu z-1 w-52 rounded-box bg-base-100 p-2 shadow-sm"
								>
									<li><a href={`/activities/${item.slug}`}>View</a></li>
									<li><a href={`/activities/${item.slug}/edit`}>Edit</a></li>
									<li>
										<a
											href={`/activities/${item.slug}/delete`}
											use:confirmAction={{
												title: 'Eliminar',
												message: '¿Seguro que quieres eliminar este elemento?',
												confirmText: 'Eliminar',
												cancelText: 'Cancelar',
												danger: true
											}}>Delete</a
										>
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
	<p>No hay actividades.</p>
{/if}
