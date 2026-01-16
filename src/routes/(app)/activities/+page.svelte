<script lang="ts">
	import type { ActivityListItem, Column } from '$lib/types';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

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
	import { Calendar, FilterAlt, OrangeSlice, Cancel } from 'svelte-iconoir';

	const fruits = [
		{ value: 'mango', label: 'Mango' },
		{ value: 'watermelon', label: 'Watermelon' },
		{ value: 'apple', label: 'Apple' },
		{ value: 'pineapple', label: 'Pineapple' },
		{ value: 'orange', label: 'Orange' },
		{ value: 'grape', label: 'Grape' },
		{ value: 'strawberry', label: 'Strawberry' },
		{ value: 'banana', label: 'Banana' },
		{ value: 'kiwi', label: 'Kiwi' },
		{ value: 'peach', label: 'Peach' },
		{ value: 'cherry', label: 'Cherry' },
		{ value: 'blueberry', label: 'Blueberry' },
		{ value: 'raspberry', label: 'Raspberry' },
		{ value: 'blackberry', label: 'Blackberry' },
		{ value: 'plum', label: 'Plum' },
		{ value: 'apricot', label: 'Apricot' },
		{ value: 'pear', label: 'Pear' },
		{ value: 'grapefruit', label: 'Grapefruit' }
	];

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
		};
	} = $props();

	const { items, pagination } = data;
	const { pageSize, total } = pagination;

	const columns: Column<ActivityListItem>[] = [
		{ key: 'title', title: 'Título', sortable: true },
		{ key: 'location', title: 'Ubicación', sortable: true },
		{ key: 'rating', title: 'Valoración', sortable: true },
		{ key: 'isFreeTour', title: 'Free Tour', sortable: true }
	];

	function handlePageChange(newPage: number) {
		goto(`/activities?page=${newPage}&pageSize=${pageSize}`);
	}

	let dateRangeFilter = $state<DateRange | undefined>();

	function handleDateRangeChange(newRange: DateRange | undefined) {
		console.log('📆 Filtro de fechas - Rango seleccionado:', newRange);
		if (newRange?.start && newRange?.end) {
			console.log('📆 Filtro de fechas - Inicio:', newRange.start.toString());
			console.log('📆 Filtro de fechas - Fin:', newRange.end.toString());
			const days = newRange.end.compare(newRange.start);
			console.log('📆 Filtro de fechas - Días seleccionados:', days);
		}
	}

	function handleSort(columnKey: keyof ActivityListItem) {
		console.log('🔄 Ordenar por:', columnKey);
		// TODO: Implementar lógica de ordenamiento
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
		<input type="checkbox" class="toggle bg-base-200" />
		<span class="text-sm">Free tours</span>
	</label>

	<select class="select">
		<option disabled selected>Pick a font</option>
		<option>Inter</option>
		<option>Poppins</option>
		<option>Raleway</option>
	</select>

	<ComboBox items={fruits} placeholder="Search a fruit" name="favoriteFruit" icon={OrangeSlice} />

	<div class="ml-auto flex items-center gap-2">
		<div class="tooltip" data-tip="Filtros avanzados">
			<button class="btn btn-square">
				<FilterAlt />
			</button>
		</div>
		<div class="tooltip" data-tip="Limpiar filtros">
			<button class="btn btn-square btn-soft btn-error">
				<Cancel />
			</button>
		</div>
	</div>
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
							<td>
								{#if col.key === 'title'}
									<a href={`/activities/${item.slug}`}>
										{item[col.key]}
									</a>
								{:else if col.key === 'rating'}
									<div class="flex items-center gap-2">
										<StarRating value={item.rating} />
										{#if item.rating !== null}
											<span class="text-sm">{item.rating.toFixed(1)}</span>
										{/if}
									</div>
								{:else}
									{item[col.key]}
								{/if}
							</td>
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
