<script lang="ts">
	/**
	 * Edit attraction page.
	 * Loads the existing attraction data and renders the form in edit mode.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import AttractionForm from '../../components/AttractionForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: PageProps = $props();

	const breadcrumbs = $derived(
		buildBreadcrumbs(page.url.pathname, {
			label: data.attraction.name || m.attractions_breadcrumbAttraction()
		})
	);
</script>

<svelte:head>
	<title>{m.attractions_editPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.attractions_editPageTitle()} {breadcrumbs} />

<AttractionForm
	form={data.form}
	mode="edit"
	attractionId={data.attraction.id}
	activityCount={data.attraction.activityCount}
	availableLocations={data.availableLocations}
/>
