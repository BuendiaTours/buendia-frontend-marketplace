<script lang="ts">
	/**
	 * Página de creación de nueva actividad
	 *
	 * Utiliza el componente ActivityForm compartido en modo 'create'
	 * para reutilizar toda la lógica y UI del formulario de edición.
	 */
	import type { PageData } from './$types';
	import ActivityForm from '../components/ActivityForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Nueva Actividad - Backoffice</title>
</svelte:head>

<LocationBar title="Nueva Actividad" breadcrumbs={data.breadcrumbs} />

<ActivityForm {data} mode="create" />
