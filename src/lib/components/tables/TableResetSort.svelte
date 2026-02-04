<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	/**
	 * Componente reutilizable para botón de reset de ordenación en tablas
	 *
	 * @example Uso básico
	 * ```svelte
	 * <TableResetSort currentSort={sort} />
	 * ```
	 *
	 * @example Con texto personalizado
	 * ```svelte
	 * <TableResetSort
	 *   currentSort={sort}
	 *   config={{ buttonText: 'Limpiar orden' }}
	 * />
	 * ```
	 */

	interface TableResetSortConfig {
		buttonText: string;
		buttonClass: string;
	}

	interface Props {
		currentSort?: { field: string | null; order: 'asc' | 'desc' | null } | null;
		config?: Partial<TableResetSortConfig>;
	}

	const DEFAULT_CONFIG: TableResetSortConfig = {
		buttonText: 'Reset sort',
		buttonClass: 'btn btn-soft btn-sm btn-error'
	};

	let { currentSort, config = {} }: Props = $props();

	// Merge de configuración con defaults
	const cfg = $derived({ ...DEFAULT_CONFIG, ...config });

	// Solo mostrar el botón si hay un sort activo
	const showButton = $derived(currentSort?.field !== null && currentSort?.field !== undefined);

	async function handleResetSort() {
		const currentParams = page.url.searchParams;
		const pathname = page.url.pathname;
		const newParams = new URLSearchParams(currentParams.toString());

		// Eliminar parámetros de ordenación
		newParams.delete('sort');
		newParams.delete('order');

		// Construir nueva URL
		const newUrl = newParams.toString() ? `${pathname}?${newParams.toString()}` : pathname;

		await goto(newUrl, {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	}
</script>

{#if showButton}
	<button type="button" class={cfg.buttonClass} onclick={handleResetSort}>
		{cfg.buttonText}
	</button>
{/if}
