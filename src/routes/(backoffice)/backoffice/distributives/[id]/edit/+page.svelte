<script lang="ts">
	/**
	 * Edit distributive page.
	 * Loads the existing distributive data and renders the form in edit mode.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import DistributiveForm from '../../components/DistributiveForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: PageProps = $props();

	const breadcrumbs = $derived(
		buildBreadcrumbs(page.url.pathname, {
			label: data.distributive.name || m.distributives_breadcrumbResource()
		})
	);
</script>

<svelte:head>
	<title>{m.distributives_editPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.distributives_editPageTitle()} {breadcrumbs} />

<DistributiveForm
	form={data.form}
	mode="edit"
	distributiveId={data.distributive.id}
	distributiveStatus={data.distributive.status}
	totalActivities={data.distributive.totalActivities}
	categories={data.distributive.categories}
	availableCategories={data.availableCategories}
	attractions={data.distributive.attractions}
	availableAttractions={data.availableAttractions}
	locations={data.distributive.locations}
	availableLocations={data.availableLocations}
/>
