<script lang="ts">
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import FreeTourForm from '../../components/FreeTourForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: PageProps = $props();

	const breadcrumbs = $derived(
		buildBreadcrumbs(page.url.pathname, {
			label: data.freeTour.title || m.freeTours_breadcrumbResource()
		})
	);
</script>

<svelte:head>
	<title>{m.freeTours_editPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.freeTours_editPageTitle()} {breadcrumbs} />

<FreeTourForm
	form={data.form}
	mode="edit"
	freeTourId={data.freeTour.id}
	freeTourStatus={data.freeTour.status}
	availableCategories={data.availableCategories}
	availableDestinations={data.availableDestinations}
	entries={data.freeTour.entries}
	availableActivities={data.availableActivities}
/>
