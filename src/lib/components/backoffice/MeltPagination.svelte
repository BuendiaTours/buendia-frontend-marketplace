<!-- 
Componente Pagination con Melt-UI y estilos DaisyUI
https://melt-ui.com/docs/builders/pagination

Ejemplo de uso:
<MeltPagination count={100} perPage={10} onPageChange={handlePageChange} />

Props disponibles:
- count: number (total de items)
- perPage: number (items por página, default: 10)
- siblingCount: number (páginas visibles alrededor de la actual, default: 1)
- onPageChange: (page: number) => void (callback cuando cambia la página)
-->

<script lang="ts">
	import { createPagination, melt } from '@melt-ui/svelte';
	import { NavArrowLeft, NavArrowRight } from 'svelte-iconoir';

	type Props = {
		count: number;
		perPage?: number;
		siblingCount?: number;
		onPageChange?: (page: number) => void;
	};

	let { count, perPage = 10, siblingCount = 1, onPageChange }: Props = $props();

	const {
		elements: { root, pageTrigger, prevButton, nextButton },
		states: { pages, range },
		options
	} = createPagination({
		count: 0,
		perPage: 10,
		defaultPage: 1,
		siblingCount: 1,
		onPageChange: ({ next }) => {
			onPageChange?.(next);
			return next;
		}
	});

	// Actualizar opciones cuando cambien los props
	$effect(() => {
		options.count.set(count);
		options.perPage.set(perPage);
		options.siblingCount.set(siblingCount);
	});
</script>

<nav use:melt={$root} class="my-8 flex items-center justify-center">
	<button
		use:melt={$prevButton}
		class="btn btn-square btn-ghost btn-sm data-[disabled]:btn-disabled mr-2"
	>
		<NavArrowLeft class="size-5" />
	</button>

	<div class="join">
		{#each $pages as page (page.key)}
			{#if page.type === 'ellipsis'}
				<div class="btn btn-disabled join-item btn-sm select-none">...</div>
			{:else}
				<button
					use:melt={$pageTrigger(page)}
					class="btn join-item btn-sm data-[selected]:text-success"
				>
					{page.value}
				</button>
			{/if}
		{/each}
	</div>

	<button
		use:melt={$nextButton}
		class="btn btn-square btn-ghost btn-sm data-[disabled]:btn-disabled ml-2"
	>
		<NavArrowRight class="size-5" />
	</button>
</nav>

<!-- Opcional: Mostrar rango de items -->
<!-- <p class="text-center text-sm opacity-60">
	Mostrando {$range.start} - {$range.end} de {count}
</p> -->
