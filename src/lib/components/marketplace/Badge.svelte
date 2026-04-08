<script lang="ts">
	/**
	 * Badge - Tag con o sin icono
	 *
	 * Muestra un badge con texto y opcionalmente un icono de Iconoir.
	 * El icono se pasa como string con el nombre del componente de Iconoir.
	 *
	 * @component
	 */

	import * as Icons from '$lib/icons/Linear';
	import type { Component } from 'svelte';

	type Badge = {
		icon?: string;
		title: string;
		color?: string;
	};

	let { data }: { data: Badge } = $props();

	const IconComponent = $derived(
		data.icon ? (Icons[data.icon as keyof typeof Icons] as Component) : null
	);
</script>

<div class="bnd-badge inline-flex items-center gap-2 rounded-sm uppercase {data.color || ''}">
	{#if IconComponent}
		<IconComponent class="size-4" />
	{/if}
	{data.title}
</div>
