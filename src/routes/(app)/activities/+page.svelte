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
	import { Popover, Dialog, type DateRange } from 'bits-ui';

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
			// Limpiar filtro de fechas (null elimina el parámetro de la URL)
			applyFilterPatch({
				from: null as any,
				to: null as any
			});
		}
	}

	const hasDateRange = $derived(
		dateRangeFilter?.start !== undefined && dateRangeFilter?.end !== undefined
	);

	function handleClearDateRange() {
		handleDateRangeChange(undefined);
	}

	// Función para establecer presets de rangos de fechas
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
				const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Lunes como inicio
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
			location: locationValue ? locationValue : (null as any)
		});
	}

	function handleClearLocation() {
		handleLocationChange(undefined);
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

	// Estado del diálogo de filtros avanzados
	let advancedFiltersOpen = $state(false);

	// Estado de los filtros avanzados (categorías adicionales)
	let advancedFilters = $state({
		kidsFreeTour: false,
		breakfastIncluded: false,
		wheelchairAccessible: false,
		audioGuideAvailable: false,
		photographyAllowed: false,
		smallGroup: false
	});
	const hasAdvancedFilters = $derived(Object.values(advancedFilters).some((value) => value));

	function handleAdvancedFiltersApply() {
		console.log('🔍 Filtros avanzados aplicados:', advancedFilters);
		// TODO: Integrar con el sistema de filtros URL cuando el backend soporte estos campos
		advancedFiltersOpen = false;
	}
</script>

<h1 class="text-lg">Actividades</h1>

<div
	class="bnd-filter-bar mt-6 flex items-center gap-8 rounded-box border border-base-content/9 bg-base-100 p-2"
>
	<Popover.Root>
		<div class="tooltip" data-tip="Selecciona rango de fechas">
			<Popover.Trigger class="btn btn-square">
				<Calendar class={hasDateRange ? 'text-success' : 'text-base-content/70'} />
			</Popover.Trigger>
		</div>
		<Popover.Content
			side="bottom"
			align="start"
			alignOffset={-10}
			class="z-50 mt-1 rounded-box border border-base-content/10 bg-base-100 p-4 shadow-lg"
		>
			<div class="flex flex-col gap-2">
				<div class="flex gap-2">
					<button class="btn btn-soft btn-xs" onclick={() => setDateRangePreset('today')}>
						Hoy
					</button>
					<button class="btn btn-soft btn-xs" onclick={() => setDateRangePreset('thisWeek')}>
						Esta semana
					</button>
					<button class="btn btn-soft btn-xs" onclick={() => setDateRangePreset('next15Days')}>
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
					<RangeCalendar
						bind:value={dateRangeFilter}
						onValueChange={handleDateRangeChange}
						numberOfMonths={2}
					/>
				</div>
			</div>
		</Popover.Content>
	</Popover.Root>

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
		<ComboBox
			items={locations}
			placeholder="Filter by locations"
			name="filterLocation"
			icon={Map}
			type="single"
			bind:value={selectedLocation}
			onValueChange={handleLocationChange}
		/>
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
		<Dialog.Root bind:open={advancedFiltersOpen}>
			<div class="tooltip" data-tip="Filtros avanzados">
				<Dialog.Trigger class="btn btn-square">
					<FilterAlt class={hasAdvancedFilters ? 'text-success' : 'text-base-content/60'} />
				</Dialog.Trigger>
			</div>

			<Dialog.Portal>
				<Dialog.Overlay class="fixed inset-0 z-50 bg-black/60" />
				<Dialog.Content
					class="fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-box border border-base-content/10 bg-base-100 p-6 shadow-xl"
				>
					<div class="mb-4 flex items-start justify-between">
						<Dialog.Title class="text-xl font-semibold">Filtros avanzados</Dialog.Title>
						<Dialog.Close class="btn -mt-4 -mr-4 btn-square btn-ghost btn-sm">
							<Cancel />
						</Dialog.Close>
					</div>

					<Dialog.Description class="mb-6 text-sm text-base-content/70">
						Selecciona las características adicionales que deseas filtrar
					</Dialog.Description>

					<div class="space-y-4">
						<label class="flex cursor-pointer items-center gap-3">
							<input
								type="checkbox"
								class="checkbox checkbox-sm"
								bind:checked={advancedFilters.kidsFreeTour}
							/>
							<span class="label-text">Niños gratis</span>
						</label>

						<label class="flex cursor-pointer items-center gap-3">
							<input
								type="checkbox"
								class="checkbox checkbox-sm"
								bind:checked={advancedFilters.breakfastIncluded}
							/>
							<span class="label-text">Desayuno incluido</span>
						</label>

						<label class="flex cursor-pointer items-center gap-3">
							<input
								type="checkbox"
								class="checkbox checkbox-sm"
								bind:checked={advancedFilters.wheelchairAccessible}
							/>
							<span class="label-text">Accesible para sillas de ruedas</span>
						</label>

						<label class="flex cursor-pointer items-center gap-3">
							<input
								type="checkbox"
								class="checkbox checkbox-sm"
								bind:checked={advancedFilters.audioGuideAvailable}
							/>
							<span class="label-text">Audioguía disponible</span>
						</label>

						<label class="flex cursor-pointer items-center gap-3">
							<input
								type="checkbox"
								class="checkbox checkbox-sm"
								bind:checked={advancedFilters.photographyAllowed}
							/>
							<span class="label-text">Fotografía permitida</span>
						</label>

						<label class="flex cursor-pointer items-center gap-3">
							<input
								type="checkbox"
								class="checkbox checkbox-sm"
								bind:checked={advancedFilters.smallGroup}
							/>
							<span class="label-text">Grupo pequeño (máx. 15 personas)</span>
						</label>
					</div>

					<div class="mt-6 flex gap-2">
						<button class="btn btn-soft btn-error">Limpiar filtros</button>
						<Dialog.Close class="btn ml-auto btn-ghost">Cancelar</Dialog.Close>
						<button class="btn btn-outline btn-primary" onclick={handleAdvancedFiltersApply}>
							Aplicar filtros
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>

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
