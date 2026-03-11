<script lang="ts">
	/**
	 * AuthorMeta - Muestra metadatos de un autor con inicial y datos de texto
	 *
	 * @component
	 */

	type Props = {
		name: string;
		desc?: string;
		wrapperClass?: string;
	};

	let { name, desc, wrapperClass }: Props = $props();

	const initial = $derived(name ? name.charAt(0).toUpperCase() : '');
</script>

<div class="flex w-full items-start gap-3 {wrapperClass}">
	<div class="flex w-12 shrink-0">
		<div
			class="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-subtle)] text-neutral-800"
		>
			<span class="h3-editorial translate-x-0.5 -translate-y-0.5">{initial}.</span>
		</div>
	</div>
	<div class="flex min-w-0 flex-col self-center">
		{#if name}<span class="p-lg font-bold">{name}</span>{/if}
		{#if desc}<span class="p-sm text-[var(--color-text-secondary)]">{desc}</span>{/if}
	</div>
</div>
