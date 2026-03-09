<script lang="ts">
	/**
	 * Badge - Tag con o sin icono
	 *
	 * Muestra un badge con texto y opcionalmente un icono de @solar-icons.
	 * El icono se pasa como string con el nombre del componente de @solar-icons.
	 *
	 * @component
	 */

	import * as Icons from '$lib/icons/Linear';
	import type { ComponentType } from 'svelte';

	type Badge = {
		icon?: string;
		title: string;
		color?: string;
	};

	let { data }: { data: Badge } = $props();

	// Mapeo dinámico del nombre del icono al componente
	const iconComponent = $derived(
		data.icon ? (Icons[data.icon as keyof typeof Icons] as ComponentType) : null
	);
</script>

<div
	class="e-badge p-xs inline-flex items-center gap-2 rounded-sm px-2 py-1 font-bold uppercase {data.color ||
		''}"
>
	{#if iconComponent}
		<svelte:component this={iconComponent} class="size-5" />
	{/if}
	{data.title}
</div>
