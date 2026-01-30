<script lang="ts">
	import { onMount } from 'svelte';

	/**
	 * Componente reutilizable para acordeones en formularios
	 *
	 * @param open - Si el acordeón debe estar abierto por defecto
	 * @param name - Nombre del grupo de acordeones (para comportamiento radio)
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
	 */

	interface Props {
		open?: boolean;
		name?: string;
		class?: string;
		title: import('svelte').Snippet;
		content: import('svelte').Snippet;
		asideContent?: import('svelte').Snippet;
	}

	let { open = false, name, class: className, title, content, asideContent }: Props = $props();

	let detailsElement: HTMLDetailsElement;
	let hasChildAccordions = $state(false);

	onMount(() => {
		// Detectar si hay acordeones hijos
		const childDetails = detailsElement.querySelectorAll(
			':scope > .collapse-content details.collapse'
		);
		hasChildAccordions = childDetails.length > 0;
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
	class="collapse-arrow collapse border border-base-content/9 bg-base-100 {className}"
	{name}
	{open}
>
	<summary class="text-md collapse-title">
		<div class="flex w-full items-center justify-between gap-2">
			<div class="flex items-center gap-2">{@render title()}</div>

			{#if hasChildAccordions}
				<div class="flex gap-1">
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
				</div>
			{/if}
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
