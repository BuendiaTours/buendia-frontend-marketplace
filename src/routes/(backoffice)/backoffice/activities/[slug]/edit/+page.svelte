<script lang="ts">
	/**
	 * Página de edición de actividad
	 *
	 * Utiliza el componente ActivityForm compartido en modo 'edit'
	 * para reutilizar toda la lógica y UI del formulario.
	 */
	import type { PageData } from './$types';
	import ActivityForm from '../../components/ActivityForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Editar Actividad - Backoffice</title>
</svelte:head>

<LocationBar title="Editar Actividad" breadcrumbs={data.breadcrumbs} />

<ActivityForm {data} mode="edit" activitySlug={data.activity.slug} />
