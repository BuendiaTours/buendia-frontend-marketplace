<script lang="ts">
	import FormErrorMsg from './FormErrorMsg.svelte';
	import { Menu, Cancel, Plus } from 'svelte-iconoir';
	import { showConfirmDialog } from '$lib/actions/backoffice/confirmAction';
	import { tick } from 'svelte';

	/**
	 * Componente reutilizable para gestión de listas de strings ordenables con drag & drop
	 * Permite añadir texto libre y ordenar los items
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
	 * <FormOrderedStringList
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
		error?: any;
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
	let textareaRefs: HTMLTextAreaElement[] = [];

	async function addItem() {
		items = [...items, ''];
		await tick();
		const lastIndex = items.length - 1;
		if (textareaRefs[lastIndex]) {
			textareaRefs[lastIndex].focus();
		}
	}

	function removeItem(index: number) {
		items = items.filter((_, i) => i !== index);
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

	<div class="card p-4">
		{#if items.length > 0}
			<div class="mb-2 space-y-1">
				{#each items as item, index (index)}
					<div
						class="card flex flex-row items-center gap-2 px-2 py-1 transition-colors"
						class:opacity-50={draggedIndex === index}
						role="listitem"
						ondragover={handleDragOver}
						ondrop={(e) => handleDrop(e, index)}
					>
						<!-- Drag handle -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="text-base-content/50 hover:text-base-content cursor-move"
							draggable="true"
							ondragstart={(e) => handleDragStart(e, index)}
							ondragend={handleDragEnd}
						>
							<Menu class="size-5" />
						</div>

						<!-- Textarea auto-expandible -->
						<textarea
							bind:this={textareaRefs[index]}
							name={`${id}[]`}
							value={item}
							oninput={(e) => updateItem(index, e.currentTarget.value)}
							{placeholder}
							class="py-1.8 textarea textarea-sm field-sizing-content min-h-[2em] flex-1 resize-none px-2 leading-4"
							rows="1"
						></textarea>

						<!-- Delete button -->
						<div class="tooltip" data-tip="Eliminar este elemento">
							<button
								type="button"
								class="btn btn-square btn-soft btn-xs btn-error"
								onclick={() => removeItem(index)}
							>
								<Cancel class="size-4" />
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<div class="flex items-center gap-2">
			{#if items.length > 0}
				<button type="button" class="btn btn-soft btn-xs btn-error" onclick={handleRemoveAll}>
					Eliminar todos
				</button>
			{:else}
				<span class="text-base-content/30 text-sm">{emptyMessage}</span>
			{/if}

			<button type="button" class="btn btn-soft btn-xs ml-auto" onclick={addItem}>
				<Plus class="size-4" />
				Añadir elemento
			</button>
		</div>
	</div>
	<FormErrorMsg {error} />
</div>
