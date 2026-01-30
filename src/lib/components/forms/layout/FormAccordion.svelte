<script lang="ts">
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
		title: import('svelte').Snippet;
		content: import('svelte').Snippet;
	}

	let { open = false, name, title, content }: Props = $props();
</script>

<details class="collapse-arrow collapse border border-base-content/9 bg-base-100" {name} {open}>
	<summary class="text-md collapse-title">
		{@render title()}
	</summary>
	<div class="collapse-content grid grid-cols-1 gap-x-6 gap-y-4 pl-64 md:grid-cols-12">
		{@render content()}
	</div>
</details>
