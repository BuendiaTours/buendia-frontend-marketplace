<script lang="ts">
	import FormErrorMsg from './FormErrorMsg.svelte';
	import MeltComboBox from '../MeltComboBox.svelte';
	import { ArrowUp, ArrowDown, NavArrowUp, NavArrowDown } from 'svelte-iconoir';

	/**
	 * Componente reutilizable para gestión de listas ordenables con selección mediante ComboBox
	 *
	 * @param id - ID del campo para el formulario
	 * @param label - Texto del label principal
	 * @param items - Array de items seleccionados (bindable)
	 * @param availableItems - Array de todos los items disponibles para seleccionar
	 * @param error - Mensaje(s) de error de validación
	 * @param badge - (Opcional) Badge informativo
	 * @param placeholder - (Opcional) Placeholder del ComboBox
	 * @param wrapperClass - (Opcional) Clases CSS del contenedor
	 * @param emptyMessage - (Opcional) Mensaje cuando no hay items
	 *
	 * @example
	 * ```svelte
	 * <FormOrderedList
	 *   id="attractions"
	 *   label="Attractions"
	 *   bind:items={$form.attractions}
	 *   availableItems={data.availableAttractions}
	 *   error={$errors.attractions?._errors}
	 * />
	 * ```
	 */

	interface Item {
		id: string;
		name: string;
	}

	interface AvailableItem {
		id: string;
		name: string;
	}

	interface Props {
		id: string;
		label: string;
		items: Item[];
		availableItems?: AvailableItem[];
		error?: string | string[];
		badge?: string;
		placeholder?: string;
		wrapperClass?: string;
		emptyMessage?: string;
	}

	let {
		id,
		label,
		items = $bindable(),
		availableItems = [],
		error,
		badge,
		placeholder = 'Selecciona un elemento...',
		wrapperClass = 'md:col-span-12',
		emptyMessage = 'No hay elementos asociados'
	}: Props = $props();

	let selectedItemId = $state<string>('');

	const itemsForCombobox = $derived(
		availableItems.map((item) => ({
			value: item.id,
			label: item.name
		}))
	);

	function handleItemSelect(value: string | undefined) {
		if (!value) return;

		const item = availableItems.find((i) => i.id === value);
		if (!item) return;

		const alreadyExists = items.some((i) => i.id === item.id);
		if (alreadyExists) return;

		items = [...items, { id: item.id, name: item.name }];
		selectedItemId = '';
	}

	function moveItemToTop(index: number) {
		if (index === 0) return;
		const item = items[index];
		items = [item, ...items.filter((_, i) => i !== index)];
	}

	function moveItemUp(index: number) {
		if (index === 0) return;
		const newItems = [...items];
		[newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
		items = newItems;
	}

	function moveItemDown(index: number) {
		if (index === items.length - 1) return;
		const newItems = [...items];
		[newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
		items = newItems;
	}

	function moveItemToBottom(index: number) {
		if (index === items.length - 1) return;
		const item = items[index];
		items = [...items.filter((_, i) => i !== index), item];
	}
</script>

<div class={wrapperClass}>
	<div class="label text-sm" class:flex={badge} class:justify-between={badge}>
		<span>{label}</span>
		{#if badge}
			<span>{badge}</span>
		{/if}
	</div>

	<div class="rounded-lg border border-base-content/10 p-4">
		<MeltComboBox
			{id}
			items={itemsForCombobox}
			type="single"
			bind:value={selectedItemId}
			onValueChange={handleItemSelect}
			{placeholder}
		/>

		{#if items.length > 0}
			<div class="mt-4 overflow-x-auto">
				<table class="table table-sm">
					<thead>
						<tr>
							<th class="w-12"></th>
							<th>Nombre</th>
							<th class="w-40 text-center">Ordenar</th>
						</tr>
					</thead>
					<tbody>
						{#each items as item, index}
							<tr>
								<td>
									<input type="checkbox" class="checkbox checkbox-sm" />
								</td>
								<td>{item.name}</td>
								<td>
									<div class="flex justify-center gap-1">
										<button
											type="button"
											class="btn btn-square btn-ghost btn-xs"
											onclick={() => moveItemToTop(index)}
											disabled={index === 0}
											title="Mover al inicio"
										>
											<NavArrowUp size={16} />
										</button>
										<button
											type="button"
											class="btn btn-square btn-ghost btn-xs"
											onclick={() => moveItemUp(index)}
											disabled={index === 0}
											title="Mover arriba"
										>
											<ArrowUp size={16} />
										</button>
										<button
											type="button"
											class="btn btn-square btn-ghost btn-xs"
											onclick={() => moveItemDown(index)}
											disabled={index === items.length - 1}
											title="Mover abajo"
										>
											<ArrowDown size={16} />
										</button>
										<button
											type="button"
											class="btn btn-square btn-ghost btn-xs"
											onclick={() => moveItemToBottom(index)}
											disabled={index === items.length - 1}
											title="Mover al final"
										>
											<NavArrowDown size={16} />
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="mt-4">
				<span class="text-sm text-base-content/30">{emptyMessage}</span>
			</div>
		{/if}

		<FormErrorMsg {error} />
	</div>
</div>
