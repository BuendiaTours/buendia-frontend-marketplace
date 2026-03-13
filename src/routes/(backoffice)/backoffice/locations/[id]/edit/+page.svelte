<script lang="ts">
	/**
	 * Página de edición de ubicación
	 */
	import type { PageData } from './$types';
	import LocationForm from '../../components/LocationForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Editar Ubicación - Backoffice</title>
</svelte:head>

<LocationBar title="Editar Ubicación" breadcrumbs={data.breadcrumbs} />

<LocationForm
	data={{ form: data.form }}
	mode="edit"
	locationId={data.location.id}
	parentName={data.parentName}
/>
