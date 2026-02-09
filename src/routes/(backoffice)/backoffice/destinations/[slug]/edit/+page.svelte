<script lang="ts">
	/**
	 * Página de edición de destino
	 *
	 * Utiliza el componente DestinationForm compartido en modo 'edit'
	 */
	import type { PageData } from './$types';
	import DestinationForm from '../../components/DestinationForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Editar Destino - Backoffice</title>
</svelte:head>

<LocationBar title="Editar Destino" breadcrumbs={data.breadcrumbs} />

<DestinationForm {data} mode="edit" destinationSlug={data.destination.slug} />
