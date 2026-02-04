<script lang="ts">
	/**
	 * Página de edición de atracción
	 *
	 * Utiliza el componente AttractionForm compartido en modo 'edit'
	 */
	import type { PageData } from './$types';
	import AttractionForm from '../../components/AttractionForm.svelte';
	import LocationBar from '$lib/layout/partials/LocationBar.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Editar Atracción - Backoffice</title>
</svelte:head>

<LocationBar title="Editar Atracción" breadcrumbs={data.breadcrumbs} />

<AttractionForm {data} mode="edit" attractionSlug={data.attraction.slug} />
