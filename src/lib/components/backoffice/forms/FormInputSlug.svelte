<script lang="ts">
	import FormErrorMsg from './FormErrorMsg.svelte';
	import { Refresh } from '@solar-icons/svelte/Outline';
	import { slugify } from '$lib/utils/strings';

	/**
	 * Componente reutilizable para campos de slug con generación automática
	 *
	 * @example
	 * ```svelte
	 * // Slug básico generado desde el título
	 * <FormInputSlug
	 *   id="slug"
	 *   label="Slug"
	 *   bind:value={$form.slug}
	 *   sourceValue={$form.title}
	 *   error={$errors.slug}
	 * />
	 *
	 * // Con badge y tooltip personalizado
	 * <FormInputSlug
	 *   id="slug"
	 *   label="Slug"
	 *   badge="auto-generado"
	 *   bind:value={$form.slug}
	 *   sourceValue={$form.name}
	 *   error={$errors.slug}
	 *   generateTooltip="Genera slug a partir del nombre"
	 *   wrapperClass="md:col-span-12"
	 * />
	 * ```
	 */

	type Props = {
		id: string;
		label: string;
		value: string;
		sourceValue: string;
		error?: string | string[];
		badge?: string;
		generateTooltip?: string;
		disabled?: boolean;
		wrapperClass?: string;
		[key: string]: unknown;
	};

	let {
		id,
		label,
		value = $bindable(),
		sourceValue,
		error,
		badge,
		generateTooltip = 'Genera slug automáticamente',
		disabled = false,
		wrapperClass = 'md:col-span-12',
		...restProps
	}: Props = $props();

	function generateSlug() {
		if (sourceValue) {
			value = slugify(sourceValue);
		}
	}
</script>

<div class={wrapperClass}>
	<label class="label flex items-center justify-between text-sm" for={id}>
		<span>{label}</span>
		{#if badge}
			<span class="text-xs opacity-70">{badge}</span>
		{/if}
	</label>
	<div class="flex gap-2">
		<input
			type="text"
			{id}
			name={id}
			class="input w-full"
			class:input-error={error}
			bind:value
			{disabled}
			{...restProps}
		/>

		<div class="tooltip" data-tip={generateTooltip}>
			<button type="button" class="btn btn-square btn-soft" onclick={generateSlug} {disabled}>
				<Refresh class="size-5" />
			</button>
		</div>
	</div>
	<FormErrorMsg {error} />
</div>
