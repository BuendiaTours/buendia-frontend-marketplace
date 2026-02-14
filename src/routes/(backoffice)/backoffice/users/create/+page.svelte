<script lang="ts">
	import type { PageData } from './$types';
	import UserForm from '../components/UserForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Nuevo Usuario - Backoffice</title>
</svelte:head>

<LocationBar title="Nuevo Usuario" breadcrumbs={data.breadcrumbs} />

<UserForm {data} mode="create" />
