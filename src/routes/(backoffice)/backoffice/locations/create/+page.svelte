<script lang="ts">
	/**
	 * Página de creación de nueva ubicación
	 */
	import type { PageData } from './$types';
	import LocationForm from '../components/LocationForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Nueva Ubicación - Backoffice</title>
</svelte:head>

<LocationBar title="Nueva Ubicación" breadcrumbs={data.breadcrumbs} />

<LocationForm data={{ form: data.form }} mode="create" />
