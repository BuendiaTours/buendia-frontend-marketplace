<script lang="ts">
	import FormErrorMsg from './FormErrorMsg.svelte';
	import MeltComboBox from '../MeltComboBox.svelte';
	import { Upload, NavArrowDown, NavArrowUp, Download, Cancel } from 'svelte-iconoir';

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
	let selectedItemIds = $state<Set<string>>(new Set());

	const itemsForCombobox = $derived(
		availableItems
			.filter((item) => !items.some((selectedItem) => selectedItem.id === item.id))
			.map((item) => ({
				value: item.id,
				label: item.name
			}))
	);

	const hasSelectedItems = $derived(selectedItemIds.size > 0);

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

	function toggleItemSelection(itemId: string) {
		const newSelection = new Set(selectedItemIds);
		if (newSelection.has(itemId)) {
			newSelection.delete(itemId);
		} else {
			newSelection.add(itemId);
		}
		selectedItemIds = newSelection;
	}

	function removeItem(itemId: string) {
		items = items.filter((item) => item.id !== itemId);
	}

	// function handleDeleteSelected() {
	// 	items = items.filter((item) => !selectedItemIds.has(item.id));
	// 	selectedItemIds = new Set();
	// }
</script>

<div class={wrapperClass}>
	<div class="label flex items-center justify-between text-sm">
		<span>{label}</span>
		{#if badge}
			<span class="text-xs opacity-70">{badge}</span>
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
			<div class="mt-2">
				<table class="table table-sm">
					<thead>
						<tr>
							<th class="w-0 text-center">Ordenar</th>
							<th>Elemento</th>
							<th class="w-0"></th>
						</tr>
					</thead>
					<tbody>
						{#each items as item, index}
							<tr>
								<td class="px-0">
									<!-- <input
										type="checkbox"
										class="checkbox checkbox-sm"
										checked={selectedItemIds.has(item.id)}
										onchange={() => toggleItemSelection(item.id)}
									/> -->
									<div class="inline-flex gap-1">
										<div class="tooltip" data-tip="Mover al inicio">
											<button
												type="button"
												class="btn btn-square btn-ghost btn-xs"
												onclick={() => moveItemToTop(index)}
												disabled={index === 0}
											>
												<Upload size={16} />
											</button>
										</div>
										<div class="tooltip" data-tip="Mover al inicio">
											<button
												type="button"
												class="btn btn-square btn-ghost btn-xs"
												onclick={() => moveItemUp(index)}
												disabled={index === 0}
											>
												<NavArrowUp size={16} />
											</button>
										</div>
										<div class="tooltip" data-tip="Mover abajo">
											<button
												type="button"
												class="btn btn-square btn-ghost btn-xs"
												onclick={() => moveItemDown(index)}
												disabled={index === items.length - 1}
											>
												<NavArrowDown size={16} />
											</button>
										</div>
										<div class="tooltip" data-tip="Mover al final">
											<button
												type="button"
												class="btn btn-square btn-ghost btn-xs"
												onclick={() => moveItemToBottom(index)}
												disabled={index === items.length - 1}
											>
												<Download size={16} />
											</button>
										</div>
									</div>
								</td>
								<td>
									<span class="text-sm">{item.name}</span>
									<input type="hidden" name={`${id}[]`} value={item.id} />
								</td>
								<td class="pr-0 text-right">
									<div class="tooltip" data-tip="Eliminar este elemento">
										<button
											type="button"
											class="btn btn-square btn-soft btn-xs btn-error"
											onclick={() => removeItem(item.id)}
										>
											<Cancel size={16} />
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
				<!-- <div class="mt-2 flex justify-end">
					<button
						type="button"
						class="btn btn-soft btn-xs btn-error"
						disabled={!hasSelectedItems}
						use:confirmAction={{
							title: 'Eliminar elementos',
							message: deleteConfirmMessage,
							confirmText: 'Eliminar',
							cancelText: 'Cancelar',
							danger: true
						}}
						onclick={handleDeleteSelected}
					>
						Eliminar seleccionados {hasSelectedItems ? `(${selectedItemIds.size})` : ''}
					</button>
				</div> -->
			</div>
		{:else}
			<div class="mt-3">
				<span class="text-sm text-base-content/30">{emptyMessage}</span>
			</div>
		{/if}

		<FormErrorMsg {error} />
	</div>
</div>
