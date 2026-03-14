<script lang="ts">
	/**
	 * Create location page.
	 * Renders an empty form for creating a new location.
	 */
	import * as m from '$paraglide/messages';
	import type { PageProps } from './$types';
	import LocationForm from '../components/LocationForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.locations_createPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.locations_createPageTitle()} breadcrumbs={data.breadcrumbs} />

<LocationForm form={data.form} mode="create" />
