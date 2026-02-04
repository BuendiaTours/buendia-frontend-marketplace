<script lang="ts">
	/**
	 * Página de creación de nueva atracción
	 *
	 * Utiliza el componente AttractionForm compartido en modo 'create'
	 * para reutilizar toda la lógica y UI del formulario de edición.
	 */
	import type { PageData } from './$types';
	import AttractionForm from '../components/AttractionForm.svelte';
	import LocationBar from '$lib/layout/partials/LocationBar.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Nueva Atracción - Backoffice</title>
</svelte:head>

<LocationBar title="Nueva Atracción" breadcrumbs={data.breadcrumbs} />

<AttractionForm {data} mode="create" />
