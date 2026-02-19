<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade, scale } from 'svelte/transition';
	import { CloseSquare, Filter } from '@solar-icons/svelte/Outline';

	type FilterConfig = {
		readonly key: string;
		readonly label: string;
	};

	type Props = {
		filters: readonly FilterConfig[];
		currentFilters: Record<string, boolean>;
		onApply: (filters: Record<string, boolean>) => void;
		onClear?: () => void;
	};

	let { filters, currentFilters, onApply, onClear }: Props = $props();

	// Estado local de los filtros
	let localFilters = $state<Record<string, boolean>>({});

	// Sincronizar con los filtros actuales cuando cambien
	$effect(() => {
		filters.forEach((filter) => {
			localFilters[filter.key] = currentFilters[filter.key] ?? false;
		});
	});

	// Verificar si hay filtros activos
	const hasActiveFilters = $derived(Object.values(localFilters).some((value) => value));

	// Dialog de Melt UI
	const {
		elements: { trigger, overlay, content, title, close, portalled },
		states: { open }
	} = createDialog({
		forceVisible: true
	});

	function handleApply() {
		onApply(localFilters);
		open.set(false);
	}

	function handleClear() {
		filters.forEach((filter) => {
			localFilters[filter.key] = false;
		});
		if (onClear) {
			onClear();
		}
	}
</script>

<!-- Trigger Button -->
<div class="tooltip" data-tip="Filtros avanzados">
	<button
		use:melt={$trigger}
		class="btn btn-square btn-soft"
		class:!border-success={hasActiveFilters}
	>
		<Filter class={`size-5 ${hasActiveFilters ? 'text-success' : 'text-base'}`} />
	</button>
</div>

<!-- Dialog -->
{#if $open}
	<div use:melt={$portalled}>
		<div
			use:melt={$overlay}
			class="fixed inset-0 z-50 bg-(--default-overlay-bg)"
			transition:fade={{ duration: 150 }}
		></div>
		<div
			use:melt={$content}
			class="rounded-box border-base-300 bg-base-100 fixed top-1/2 left-1/2 z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 border p-6 shadow-xl sm:max-w-lg"
			transition:scale={{ duration: 150, start: 0.95 }}
		>
			<h2 use:melt={$title} class="mb-4 text-lg font-semibold">Filtros avanzados</h2>

			<div class="mb-6 flex flex-col gap-3">
				{#each filters as filter (filter.key)}
					<label class="flex cursor-pointer items-center gap-3">
						<input type="checkbox" class="checkbox" bind:checked={localFilters[filter.key]} />
						<span class="text-sm select-none">{filter.label}</span>
					</label>
				{/each}
			</div>

			<div class="flex justify-end gap-2">
				<button class="btn btn-ghost" onclick={handleClear}>Limpiar</button>
				<button class="btn btn-primary" onclick={handleApply}>Aplicar</button>
			</div>

			<button use:melt={$close} class="btn btn-circle btn-ghost btn-sm absolute top-4 right-4">
				<CloseSquare />
			</button>
		</div>
	</div>
{/if}
