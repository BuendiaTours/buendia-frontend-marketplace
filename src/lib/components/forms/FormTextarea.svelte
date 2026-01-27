<script lang="ts">
	import FormErrorMsg from './FormErrorMsg.svelte';

	/**
	 * Componente reutilizable para campos de textarea en formularios
	 *
	 * @example
	 * ```svelte
	 * // Textarea básico
	 * <FormTextarea
	 *   id="description"
	 *   label="Descripción"
	 *   bind:value={$form.description}
	 *   error={$errors.description}
	 * />
	 *
	 * // Textarea readonly con badge
	 * <FormTextarea
	 *   id="notes"
	 *   label="Notas"
	 *   badge="read only"
	 *   bind:value={$form.notes}
	 *   error={$errors.notes}
	 *   readonly
	 * />
	 *
	 * // Textarea con atributos adicionales
	 * <FormTextarea
	 *   id="content"
	 *   label="Contenido"
	 *   bind:value={$form.content}
	 *   error={$errors.content}
	 *   rows="10"
	 *   wrapperClass="md:col-span-12"
	 * />
	 * ```
	 */

	interface Props {
		id: string;
		label: string;
		value: string;
		error?: string | string[];
		badge?: string;
		readonly?: boolean;
		disabled?: boolean;
		placeholder?: string;
		rows?: number;
		wrapperClass?: string;
		[key: string]: any;
	}

	let {
		id,
		label,
		value = $bindable(),
		error,
		badge,
		readonly = false,
		disabled = false,
		placeholder,
		rows = 4,
		wrapperClass = 'md:col-span-12',
		...restProps
	}: Props = $props();
</script>

<div class={wrapperClass}>
	<label class="label flex items-center justify-between text-sm" for={id}>
		<span>{label}</span>
		{#if badge}
			<span class="text-xs opacity-70">{badge}</span>
		{/if}
	</label>
	<textarea
		{id}
		name={id}
		class="textarea w-full"
		class:input-error={error}
		bind:value
		{readonly}
		{disabled}
		{placeholder}
		{rows}
		{...restProps}
	></textarea>
	<FormErrorMsg {error} />
</div>
