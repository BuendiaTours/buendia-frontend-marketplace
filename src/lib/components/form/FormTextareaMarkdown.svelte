<script lang="ts">
	import FormErrorMsg from './FormErrorMsg.svelte';
	import { Editor as MarkdownEditor } from 'bytemd';
	import es from 'bytemd/locales/es.json';
	import 'bytemd/dist/index.css';

	/**
	 * Componente reutilizable para campos de textarea con editor Markdown (ByteMD)
	 *
	 * @example
	 * ```svelte
	 * // Textarea Markdown básico
	 * <FormTextareaMarkdown
	 *   id="description"
	 *   label="Descripción"
	 *   bind:value={$form.description}
	 *   error={$errors.description}
	 * />
	 *
	 * // Con badge y modo específico
	 * <FormTextareaMarkdown
	 *   id="content"
	 *   label="Contenido"
	 *   badge="markdown"
	 *   bind:value={$form.content}
	 *   error={$errors.content}
	 *   mode="tab"
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
		mode?: 'split' | 'tab' | 'auto';
		wrapperClass?: string;
	}

	let {
		id,
		label,
		value = $bindable(),
		error,
		badge = 'markdown',
		mode = 'split',
		wrapperClass = 'md:col-span-12'
	}: Props = $props();

	function handleChange(e: CustomEvent) {
		value = e.detail.value;
	}
</script>

<div class={wrapperClass}>
	<label class="label flex justify-between text-sm" for={id}>
		<span>{label}</span>
		{#if badge}
			<span class="text-xs opacity-70">{badge}</span>
		{/if}
	</label>
	<MarkdownEditor locale={es} {value} {mode} on:change={handleChange} />
	<FormErrorMsg {error} />
</div>
