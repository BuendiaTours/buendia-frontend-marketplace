<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { Menu } from 'svelte-iconoir';

	/**
	 * Componente reutilizable para acordeones en formularios
	 *
	 * @param open - Si el acordeón debe estar abierto por defecto
	 * @param name - Nombre del grupo de acordeones (para comportamiento radio)
	 * @param sortable - Si el acordeón puede ser reordenado mediante drag & drop (muestra handle cuando está cerrado)
	 *
	 * @example Uso básico
	 * ```svelte
	 * <FormAccordion open>
	 *   {#snippet title()}
	 *     Datos base
	 *   {/snippet}
	 *   {#snippet content()}
	 *     <FormInputText ... />
	 *   {/snippet}
	 * </FormAccordion>
	 * ```
	 *
	 * @example Con grupo de acordeones
	 * ```svelte
	 * <FormAccordion name="form-sections" open>
	 *   {#snippet title()}Sección 1{/snippet}
	 *   {#snippet content()}..{/snippet}
	 * </FormAccordion>
	 * <FormAccordion name="form-sections">
	 *   {#snippet title()}Sección 2{/snippet}
	 *   {#snippet content()}..{/snippet}
	 * </FormAccordion>
	 * ```
	 *
	 * @example Acordeones ordenables (sortable)
	 * ```svelte
	 * {#each items as item, index}
	 *   <FormAccordion name="item-{index}" sortable>
	 *     {#snippet title()}
	 *       {index + 1}. {item.name}
	 *     {/snippet}
	 *     {#snippet content()}
	 *       <FormInputText ... />
	 *     {/snippet}
	 *   </FormAccordion>
	 * {/each}
	 * ```
	 * Nota: Cuando sortable=true, el icono de drag solo aparece cuando el acordeón está cerrado.
	 */

	type Props = {
		open?: boolean;
		name?: string;
		class?: string;
		sortable?: boolean;
		title: Snippet;
		content: Snippet;
		asideContent?: Snippet;
		titleBarActions?: Snippet;
		ondragstart?: (event: DragEvent) => void;
		ondragover?: (event: DragEvent) => void;
		ondrop?: (event: DragEvent) => void;
		ondragend?: (event: DragEvent) => void;
	};

	let {
		open = false,
		name,
		class: className,
		sortable = false,
		asideContent,
		content,
		ondragend,
		ondragover,
		ondragstart,
		ondrop,
		title,
		titleBarActions
	}: Props = $props();

	let detailsElement: HTMLDetailsElement;
	let hasChildAccordions = $state(false);
	let isOpen = $state(false);

	onMount(() => {
		// Detectar si hay acordeones hijos
		const childDetails = detailsElement.querySelectorAll(
			':scope > .collapse-content details.collapse'
		);
		hasChildAccordions = childDetails.length > 0;

		// Sincronizar estado inicial
		isOpen = detailsElement.open;

		// Observar cambios en el estado open/closed del accordion
		const observer = new MutationObserver(() => {
			isOpen = detailsElement.open;
		});
		observer.observe(detailsElement, { attributes: true, attributeFilter: ['open'] });

		return () => observer.disconnect();
	});

	function expandAllChildren(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		// Abrir el acordeón actual
		detailsElement.open = true;
		// Abrir todos los hijos
		const childDetails = detailsElement.querySelectorAll(
			':scope > .collapse-content details.collapse'
		);
		childDetails.forEach((detail) => {
			(detail as HTMLDetailsElement).open = true;
		});
	}

	function collapseAllChildren(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		const childDetails = detailsElement.querySelectorAll(
			':scope > .collapse-content details.collapse'
		);
		childDetails.forEach((detail) => {
			(detail as HTMLDetailsElement).open = false;
		});
	}
</script>

<details
	bind:this={detailsElement}
	class="collapse-arrow border-base-content/9 bg-base-100 collapse border {className}"
	id={name}
	{name}
	{open}
	{ondragover}
	{ondrop}
>
	<summary class="text-md collapse-title">
		<div class="flex w-full items-center justify-between gap-2">
			<div class="flex items-center gap-2">
				{#if sortable && !isOpen}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="text-base-content/50 hover:text-base-content cursor-move"
						draggable="true"
						{ondragstart}
						{ondragend}
					>
						<Menu class="size-5" />
					</div>
				{/if}
				{@render title()}
			</div>

			<div class="flex gap-1">
				{#if hasChildAccordions}
					<button
						type="button"
						onclick={expandAllChildren}
						class="btn btn-ghost btn-xs"
						title="Abrir todos los hijos"
					>
						Abrir hijos
					</button>
					<button
						type="button"
						onclick={collapseAllChildren}
						class="btn btn-ghost btn-xs"
						title="Cerrar todos los hijos"
					>
						Cerrar hijos
					</button>
				{/if}
				{#if titleBarActions}
					{@render titleBarActions()}
				{/if}
			</div>
		</div>
	</summary>
	<div class="collapse-content">
		<div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-12">
			{#if asideContent}
				<div class="md:col-span-2">
					{@render asideContent()}
				</div>
			{/if}
			<div
				class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-12 {asideContent
					? 'md:col-span-10'
					: 'md:col-span-12'}"
			>
				{@render content()}
			</div>
		</div>
	</div>
</details>
