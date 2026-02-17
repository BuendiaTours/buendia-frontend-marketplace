<script lang="ts">
	/**
	 * Componente para mostrar mensajes de error de formularios
	 * Compatible con errores de Superforms (string o array de strings)
	 *
	 * @example
	 * ```svelte
	 * <FormErrorMsg error={$errors.title} />
	 *
	 * {#if $errors.slug}
	 *   <FormErrorMsg error={$errors.slug} />
	 * {/if}
	 * ```
	 */

	type Props = {
		error?: string | string[];
	};

	let { error }: Props = $props();

	const errorMessage = $derived(error ? (Array.isArray(error) ? error[0] : error) : undefined);
</script>

{#if errorMessage}
	<span class="text-error text-sm">{errorMessage}</span>
{/if}
