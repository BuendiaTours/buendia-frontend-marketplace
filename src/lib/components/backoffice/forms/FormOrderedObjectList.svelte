<script lang="ts">
	import FormErrorMsg from './FormErrorMsg.svelte';
	import MeltComboBox from '../MeltComboBox.svelte';
	import { Upload, NavArrowDown, NavArrowUp, Download, Cancel, Menu } from 'svelte-iconoir';
	import { showConfirmDialog } from '$lib/actions/backoffice/confirmAction';

	/**
	 * Componente reutilizable para gestión de listas ordenables con selección mediante ComboBox
	 * Permite seleccionar objetos de una lista predefinida y ordenarlos
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
	 * @example Uso básico (con flechas de ordenación)
	 * ```svelte
	 * <FormOrderedObjectList
	 *   id="attractions"
	 *   label="Attractions"
	 *   bind:items={$form.attractions}
	 *   availableItems={data.availableAttractions}
	 *   error={$errors.attractions?._errors}
	 * />
	 * ```
	 *
	 * @example Con drag and drop
	 * ```svelte
	 * <FormOrderedObjectList
	 *   id="attractions"
	 *   label="Attractions"
	 *   bind:items={$form.attractions}
	 *   availableItems={data.availableAttractions}
	 *   config={{ useDragAndDrop: true }}
	 * />
	 * ```
	 *
	 * @example Con botón de eliminar todos
	 * ```svelte
	 * <FormOrderedObjectList
	 *   id="attractions"
	 *   label="Attractions"
	 *   bind:items={$form.attractions}
	 *   availableItems={data.availableAttractions}
	 *   config={{ showRemoveAll: true }}
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

	interface FormOrderedObjectListConfig {
		useDragAndDrop: boolean;
		showRemoveAll: boolean;
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
		config?: Partial<FormOrderedObjectListConfig>;
	}

	const DEFAULT_CONFIG: FormOrderedObjectListConfig = {
		useDragAndDrop: false,
		showRemoveAll: false
	};

	let {
		id,
		label,
		items = $bindable(),
		availableItems = [],
		error,
		badge,
		placeholder = 'Selecciona un elemento...',
		wrapperClass = 'md:col-span-12',
		emptyMessage = 'No hay elementos asociados',
		config = {}
	}: Props = $props();

	// Merge de configuración con defaults
	const cfg = $derived({ ...DEFAULT_CONFIG, ...config });

	let selectedItemId = $state<string>('');
	let draggedIndex = $state<number | null>(null);

	const safeAvailableItems = $derived.by(() => {
		const resolved =
			typeof availableItems === 'function' ? (availableItems as () => unknown)() : availableItems;
		if (Array.isArray(resolved)) return resolved as AvailableItem[];
		const obj = resolved as Record<string, unknown> | null | undefined;
		if (obj && Array.isArray(obj.data)) return obj.data as AvailableItem[];
		if (obj && Array.isArray(obj.items)) return obj.items as AvailableItem[];
		return [];
	});

	const itemsForCombobox = $derived(
		safeAvailableItems
			.filter((item) => !items.some((selectedItem) => selectedItem.id === item.id))
			.map((item) => ({
				value: item.id,
				label: item.name
			}))
	);

	function handleItemSelect(value: string | undefined) {
		if (!value) return;

		const item = safeAvailableItems.find((i) => i.id === value);
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

	function removeItem(itemId: string) {
		items = items.filter((item) => item.id !== itemId);
	}

	// Drag and drop functions
	function handleDragStart(event: DragEvent, index: number) {
		draggedIndex = index;
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}
	}

	function handleDrop(event: DragEvent, dropIndex: number) {
		event.preventDefault();
		if (draggedIndex === null || draggedIndex === dropIndex) return;

		const newItems = [...items];
		const [draggedItem] = newItems.splice(draggedIndex, 1);
		newItems.splice(dropIndex, 0, draggedItem);
		items = newItems;
		draggedIndex = null;
	}

	function handleDragEnd() {
		draggedIndex = null;
	}

	async function handleRemoveAll() {
		const confirmed = await showConfirmDialog({
			title: 'Eliminar todos',
			message: '¿Seguro que quieres eliminar todos los elementos de la lista?',
			confirmText: 'Eliminar todos',
			cancelText: 'Cancelar',
			danger: true
		});
		if (confirmed) {
			items = [];
		}
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

	<div class="card p-4">
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
				<table class="table-sm table">
					<!-- thead>
						<tr>
							<th class="w-0 text-center">
								{#if !cfg.useDragAndDrop}
									Ordenar
								{/if}
							</th>
							<th>Elemento</th>
							<th class="w-0"></th>
						</tr>
					</thead -->
					<tbody>
						{#each items as item, index (item.id)}
							<tr
								class:opacity-50={draggedIndex === index}
								ondragover={cfg.useDragAndDrop ? handleDragOver : undefined}
								ondrop={cfg.useDragAndDrop ? (e) => handleDrop(e, index) : undefined}
							>
								<td class="w-0 px-0">
									{#if cfg.useDragAndDrop}
										<!-- svelte-ignore a11y_no_static_element_interactions -->
										<div
											class="text-base-content/50 hover:text-base-content cursor-move"
											draggable="true"
											ondragstart={(e) => handleDragStart(e, index)}
											ondragend={handleDragEnd}
										>
											<Menu class="size-5" />
										</div>
									{:else}
										<div class="inline-flex gap-1">
											<div class="tooltip" data-tip="Mover al inicio">
												<button
													type="button"
													class="btn btn-square btn-ghost btn-xs"
													onclick={() => moveItemToTop(index)}
													disabled={index === 0}
												>
													<Upload class="size-5" />
												</button>
											</div>
											<div class="tooltip" data-tip="Mover al inicio">
												<button
													type="button"
													class="btn btn-square btn-ghost btn-xs"
													onclick={() => moveItemUp(index)}
													disabled={index === 0}
												>
													<NavArrowUp class="size-5" />
												</button>
											</div>
											<div class="tooltip" data-tip="Mover abajo">
												<button
													type="button"
													class="btn btn-square btn-ghost btn-xs"
													onclick={() => moveItemDown(index)}
													disabled={index === items.length - 1}
												>
													<NavArrowDown class="size-5" />
												</button>
											</div>
											<div class="tooltip" data-tip="Mover al final">
												<button
													type="button"
													class="btn btn-square btn-ghost btn-xs"
													onclick={() => moveItemToBottom(index)}
													disabled={index === items.length - 1}
												>
													<Download class="size-5" />
												</button>
											</div>
										</div>
									{/if}
								</td>
								<td>
									<span class="text-sm">{item.name}</span>
									<input type="hidden" name={`${id}[]`} value={item.id} />
								</td>
								<td class="w-0 pr-0 text-right">
									<div class="tooltip" data-tip="Eliminar este elemento">
										<button
											type="button"
											class="btn btn-square btn-soft btn-xs btn-error"
											onclick={() => removeItem(item.id)}
										>
											<Cancel class="size-4" />
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
				{#if cfg.showRemoveAll}
					<div class="mt-2 flex justify-end">
						<button type="button" class="btn btn-soft btn-xs btn-error" onclick={handleRemoveAll}>
							Eliminar todos
						</button>
					</div>
				{/if}
			</div>
		{:else}
			<div class="mt-3">
				<span class="text-base-content/30 text-sm">{emptyMessage}</span>
			</div>
		{/if}

		<FormErrorMsg {error} />
	</div>
</div>
