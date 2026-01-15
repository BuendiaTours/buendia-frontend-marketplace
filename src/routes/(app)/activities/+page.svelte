<script lang="ts">
	import type { ActivityListItem, Column } from '$lib/types';
	import { checkAll } from '$lib/actions/checkAll';
	import { goto } from '$app/navigation';
	import { confirmAction } from '$lib/actions/confirmAction';

	// Components
	import Pagination from '$lib/components/Pagination.svelte';
	import { Combobox } from 'bits-ui';

	// Icons
	import {
		FilterAlt,
		OrangeSlice,
		ArrowSeparateVertical,
		FastArrowUp,
		FastArrowDown,
		Check
	} from 'svelte-iconoir';

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
		{ key: 'title' },
		{ key: 'city' },
		{ key: 'priceFrom' },
		{ key: 'currency' }
	];

	let searchValue = $state('');

	const filteredFruits = $derived(
		searchValue === ''
			? fruits
			: fruits.filter((fruit) => fruit.label.toLowerCase().includes(searchValue.toLowerCase()))
	);

	function handlePageChange(newPage: number) {
		goto(`/activities?page=${newPage}&pageSize=${pageSize}`);
	}
</script>

<h1 class="text-lg">Actividades</h1>

<div class="mt-6 flex items-center gap-8 rounded-box border border-base-content/9 bg-base-100 p-2">
	<label class="label">
		<input type="checkbox" class="toggle" />
		<span class="text-sm">Free tours</span>
	</label>
	<select class="select">
		<option disabled selected>Pick a font</option>
		<option>Inter</option>
		<option>Poppins</option>
		<option>Raleway</option>
	</select>

	<Combobox.Root
		type="multiple"
		name="favoriteFruit"
		onOpenChangeComplete={(o) => {
			if (!o) searchValue = '';
		}}
	>
		<div class="relative">
			<OrangeSlice class="absolute start-3 top-1/2 size-5 -translate-y-1/2 opacity-60" />
			<Combobox.Input
				oninput={(e) => (searchValue = e.currentTarget.value)}
				class="input-bordered input w-[296px] pr-10 pl-10"
				placeholder="Search a fruit"
				aria-label="Search a fruit"
			/>
			<Combobox.Trigger class="absolute end-3 top-1/2 size-5 -translate-y-1/2 opacity-60">
				<ArrowSeparateVertical class="size-5" />
			</Combobox.Trigger>
		</div>
		<Combobox.Portal>
			<Combobox.Content
				class="z-50 max-h-96 w-[var(--bits-combobox-anchor-width)] rounded-box border border-base-content/10 bg-base-100 shadow-lg outline-none"
				sideOffset={8}
			>
				<Combobox.ScrollUpButton class="flex w-full items-center justify-center py-2 opacity-60">
					<FastArrowUp class="size-4" />
				</Combobox.ScrollUpButton>
				<Combobox.Viewport class="p-2">
					{#each filteredFruits as fruit, i (i + fruit.value)}
						<Combobox.Item
							class="rounded-btn flex h-10 w-full cursor-pointer items-center px-3 text-sm capitalize transition-colors outline-none hover:bg-base-200 data-[highlighted]:bg-base-200"
							value={fruit.value}
							label={fruit.label}
						>
							{#snippet children({ selected })}
								{fruit.label}
								{#if selected}
									<div class="ml-auto">
										<Check class="size-4" />
									</div>
								{/if}
							{/snippet}
						</Combobox.Item>
					{:else}
						<span class="block px-3 py-2 text-sm opacity-60"> No results found, try again. </span>
					{/each}
				</Combobox.Viewport>
				<Combobox.ScrollDownButton class="flex w-full items-center justify-center py-2 opacity-60">
					<FastArrowDown class="size-4" />
				</Combobox.ScrollDownButton>
			</Combobox.Content>
		</Combobox.Portal>
	</Combobox.Root>

	<button class="btn ml-auto btn-square">
		<FilterAlt />
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
						<th>{col.key}</th>
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
