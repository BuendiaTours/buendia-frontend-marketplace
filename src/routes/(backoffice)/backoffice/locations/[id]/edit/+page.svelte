<script lang="ts">
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { PageData } from './$types';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import LocationForm from '../../components/LocationForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: { data: PageData } = $props();

	const breadcrumbs = $derived(
		buildBreadcrumbs(page.url.pathname, {
			label: data.location.name || m.locations_breadcrumbLocation()
		})
	);
</script>

<svelte:head>
	<title>{m.locations_editPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.locations_editPageTitle()} {breadcrumbs} />

<LocationForm
	data={{ form: data.form }}
	mode="edit"
	locationId={data.location.id}
	parentName={data.parentName}
/>
