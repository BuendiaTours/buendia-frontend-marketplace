<script lang="ts">
	/**
	 * Badge - Tag con o sin icono
	 *
	 * Muestra un badge con texto y opcionalmente un icono de Iconoir.
	 * El icono se pasa como string con el nombre del componente de Iconoir.
	 *
	 * @component
	 */

	import * as Icons from 'svelte-iconoir';
	import type { ComponentType } from 'svelte';

	type Badge = {
		icon?: string;
		title: string;
		class?: string;
	};

	let { data }: { data: Badge } = $props();

	// Mapeo dinámico del nombre del icono al componente
	let IconComponent = $derived(
		data.icon ? (Icons[data.icon as keyof typeof Icons] as ComponentType) : null
	);
</script>

<div
	class="bnd-badge inline-flex items-center gap-2 rounded-sm px-2 py-1 uppercase {data.class || ''}"
>
	{#if IconComponent}
		<IconComponent class="size-4" />
	{/if}
	{data.title}
</div>
