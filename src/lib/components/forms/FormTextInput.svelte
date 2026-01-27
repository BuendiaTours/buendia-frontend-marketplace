<script lang="ts">
	import FormErrorMsg from './FormErrorMsg.svelte';

	/**
	 * Componente reutilizable para campos de input en formularios
	 *
	 * @example
	 * ```svelte
	 * // Input de texto básico
	 * <FormTextInput
	 *   id="title"
	 *   label="Título"
	 *   bind:value={$form.title}
	 *   error={$errors.title}
	 * />
	 *
	 * // Input readonly con badge
	 * <FormTextInput
	 *   id="id"
	 *   label="ID"
	 *   badge="read only"
	 *   bind:value={$form.id}
	 *   error={$errors.id}
	 *   readonly
	 * />
	 *
	 * // Input numérico con atributos adicionales
	 * <FormTextInput
	 *   id="price"
	 *   label="Precio"
	 *   type="number"
	 *   bind:value={$form.price}
	 *   error={$errors.price}
	 *   min="0"
	 *   step="0.01"
	 *   wrapperClass="md:col-span-6"
	 * />
	 * ```
	 */

	interface Props {
		id: string;
		label: string;
		value: string | number;
		error?: string | string[];
		badge?: string;
		readonly?: boolean;
		disabled?: boolean;
		type?: string;
		placeholder?: string;
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
		type = 'text',
		placeholder,
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
	<input
		{type}
		{id}
		name={id}
		class="input w-full"
		class:input-error={error}
		bind:value
		{readonly}
		{disabled}
		{placeholder}
		{...restProps}
	/>
	<FormErrorMsg {error} />
</div>
