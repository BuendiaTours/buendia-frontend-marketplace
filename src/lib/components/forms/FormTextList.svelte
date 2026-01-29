<script lang="ts">
	import FormErrorMsg from './FormErrorMsg.svelte';
	import { Menu, Cancel, Plus } from 'svelte-iconoir';
	import { confirmAction } from '$lib/actions/confirmAction';

	/**
	 * Componente reutilizable para gestión de listas de texto ordenables con drag & drop
	 *
	 * @param id - ID del campo para el formulario
	 * @param label - Texto del label principal
	 * @param items - Array de strings (bindable)
	 * @param error - Mensaje(s) de error de validación
	 * @param badge - (Opcional) Badge informativo
	 * @param placeholder - (Opcional) Placeholder del textarea
	 * @param wrapperClass - (Opcional) Clases CSS del contenedor
	 * @param emptyMessage - (Opcional) Mensaje cuando no hay items
	 *
	 * @example
	 * ```svelte
	 * <FormTextList
	 *   id="excluded"
	 *   label="Elementos excluidos"
	 *   bind:items={$form.excluded}
	 *   error={$errors.excluded?._errors}
	 * />
	 * ```
	 */

	interface Props {
		id: string;
		label: string;
		items: string[];
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
		error,
		badge,
		placeholder = 'Escribe aquí...',
		wrapperClass = 'md:col-span-12',
		emptyMessage = 'No hay elementos en la lista'
	}: Props = $props();

	let draggedIndex = $state<number | null>(null);

	function addItem() {
		items = [...items, ''];
	}

	function removeItem(index: number) {
		items = items.filter((_, i) => i !== index);
	}

	function removeAllItems() {
		items = [];
	}

	function updateItem(index: number, value: string) {
		const newItems = [...items];
		newItems[index] = value;
		items = newItems;
	}

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
</script>

<div class={wrapperClass}>
	<div class="label flex items-center justify-between text-sm">
		<span>{label}</span>
		{#if badge}
			<span class="text-xs opacity-70">{badge}</span>
		{/if}
	</div>

	<div class="rounded-lg border border-base-content/10 p-4">
		{#if items.length > 0}
			<div class="space-y-2">
				{#each items as item, index (index)}
					<div
						class="flex items-center gap-2 rounded-lg border border-base-content/10 bg-base-100 p-2 transition-colors"
						class:opacity-50={draggedIndex === index}
						role="listitem"
						draggable="true"
						ondragstart={(e) => handleDragStart(e, index)}
						ondragover={handleDragOver}
						ondrop={(e) => handleDrop(e, index)}
						ondragend={handleDragEnd}
					>
						<!-- Drag handle -->
						<div class="cursor-move text-base-content/50 hover:text-base-content">
							<Menu width="20" height="20" />
						</div>

						<!-- Textarea auto-expandible -->
						<textarea
							name={`${id}[]`}
							value={item}
							oninput={(e) => updateItem(index, e.currentTarget.value)}
							{placeholder}
							class="textarea min-h-[2.5rem] flex-1 resize-none textarea-sm leading-tight"
							rows="1"
							style="field-sizing: content; max-height: 200px;"
						></textarea>

						<!-- Delete button -->
						<div class="tooltip" data-tip="Eliminar este elemento">
							<button
								type="button"
								class="btn btn-square btn-soft btn-xs btn-error"
								onclick={() => removeItem(index)}
							>
								<Cancel width="16" height="16" />
							</button>
						</div>
					</div>
				{/each}
			</div>

			<div class="mt-4 flex items-center justify-between gap-2">
				<button type="button" class="btn btn-soft btn-sm" onclick={addItem}>
					<Plus width="16" height="16" />
					Añadir elemento
				</button>

				<button
					type="button"
					class="btn btn-soft btn-sm btn-error"
					use:confirmAction={{
						title: 'Eliminar todos',
						message: '¿Seguro que quieres eliminar todos los elementos de la lista?',
						confirmText: 'Eliminar todos',
						cancelText: 'Cancelar',
						danger: true
					}}
					onclick={removeAllItems}
				>
					Eliminar todos
				</button>
			</div>
		{:else}
			<div class="py-8 text-center">
				<span class="text-sm text-base-content/30">{emptyMessage}</span>
			</div>

			<button type="button" class="btn mt-4 btn-soft btn-sm" onclick={addItem}>
				<Plus width="16" height="16" />
				Añadir elemento
			</button>
		{/if}

		<FormErrorMsg {error} />
	</div>
</div>
