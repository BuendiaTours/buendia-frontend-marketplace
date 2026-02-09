<script lang="ts">
	/**
	 * Página de creación de nuevo destino
	 *
	 * Utiliza el componente DestinationForm compartido en modo 'create'
	 */
	import type { PageData } from './$types';
	import DestinationForm from '../components/DestinationForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Nuevo Destino - Backoffice</title>
</svelte:head>

<LocationBar title="Nuevo Destino" breadcrumbs={data.breadcrumbs} />

<DestinationForm {data} mode="create" />
