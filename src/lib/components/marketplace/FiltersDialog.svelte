<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade, scale } from 'svelte/transition';
	import { untrack } from 'svelte';
	import { Tuning4, Close } from '$lib/icons/Linear';

	type FilterOption = {
		readonly key: string;
		readonly label: string;
	};

	type Props = {
		filters: FilterOption[];
		currentFilters: Record<string, boolean>;
		onApply: (filters: Record<string, boolean>) => void;
		onClear?: () => void;
		triggerClass?: string;
	};

	let { filters, currentFilters, onApply, onClear, triggerClass = '' }: Props = $props();

	let localFilters = $state<Record<string, boolean>>({});

	$effect(() => {
		filters.forEach((f) => {
			localFilters[f.key] = currentFilters[f.key] ?? false;
		});
	});

	const hasActiveFilters = $derived(Object.values(currentFilters).some(Boolean));

	const {
		elements: { trigger, overlay, content, title, close, portalled },
		states: { open }
	} = untrack(() =>
		createDialog({
			forceVisible: true
		})
	);

	function handleApply() {
		onApply(localFilters);
		open.set(false);
	}

	function handleClear() {
		filters.forEach((f) => {
			localFilters[f.key] = false;
		});
		onClear?.();
	}
</script>

<button
	use:melt={$trigger}
	class="e-button e-button-tertiary {hasActiveFilters
		? '!border-accent'
		: '!border-neutral-200'} {triggerClass}"
	class:!border-[var(--color-primary)]={hasActiveFilters}
>
	<Tuning4 class="inline size-4 {hasActiveFilters ? 'text-accent' : ''}" />
	<span class="ml-2 {hasActiveFilters ? 'text-accent' : ''}">Filtros</span>
</button>

{#if $open}
	<div use:melt={$portalled}>
		<div
			use:melt={$overlay}
			class="fixed inset-0 z-50 bg-black/40"
			transition:fade={{ duration: 150 }}
		></div>
		<div
			use:melt={$content}
			class="fixed top-1/2 left-1/2 z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--color-border-default)] bg-white p-6 shadow-xl focus:outline-none sm:max-w-md"
			transition:scale={{ duration: 150, start: 0.95 }}
		>
			<h2 use:melt={$title} class="h5 mb-6">Filtros</h2>

			{#if filters.length > 0}
				<div class="mb-6 flex flex-col gap-4">
					{#each filters as filter (filter.key)}
						<label class="flex cursor-pointer items-center gap-3">
							<input type="checkbox" class="checkbox" bind:checked={localFilters[filter.key]} />
							<span class="p-base select-none">{filter.label}</span>
						</label>
					{/each}
				</div>
			{:else}
				<p class="p-base mb-6 text-neutral-400">No hay filtros disponibles.</p>
			{/if}

			<div class="flex justify-end gap-2">
				<button class="e-button e-button-ghost" onclick={handleClear}>Limpiar</button>
				<button class="e-button e-button-primary" onclick={handleApply}>Aplicar</button>
			</div>

			<button
				use:melt={$close}
				aria-label="Cerrar"
				class="absolute top-4 right-4 cursor-pointer p-1 text-neutral-400 hover:text-neutral-700"
			>
				<Close class="size-5" />
			</button>
		</div>
	</div>
{/if}
