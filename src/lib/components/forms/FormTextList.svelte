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
		items = $bindable([]),
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
		<div class="space-y-1">
			{#if items.length > 0}
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
							<Menu class="size-5" />
						</div>

						<!-- Textarea auto-expandible -->
						<textarea
							name={`${id}[]`}
							value={item}
							oninput={(e) => updateItem(index, e.currentTarget.value)}
							{placeholder}
							class="textarea field-sizing-content min-h-[2.0rem] flex-1 resize-none textarea-sm"
							rows="1"
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
			{:else}
				<div class="py-4 text-center">
					<span class="text-sm text-base-content/30">{emptyMessage}</span>
				</div>
			{/if}
		</div>

		<div class="mt-2 flex items-center gap-2">
			{#if items.length > 0}
				<button
					type="button"
					class="btn btn-soft btn-xs btn-error"
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
			{/if}

			<button type="button" class="btn ml-auto btn-soft btn-xs" onclick={addItem}>
				<Plus class="size-4" />
				Añadir elemento
			</button>
		</div>
	</div>
	<FormErrorMsg {error} />
</div>
