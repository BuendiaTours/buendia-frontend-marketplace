<script lang="ts">
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import FreeTourForm from '../components/FreeTourForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: PageProps = $props();

	const breadcrumbs = $derived(
		buildBreadcrumbs(page.url.pathname, { label: m.freeTours_breadcrumbNew() })
	);
</script>

<svelte:head>
	<title>{m.freeTours_createPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.freeTours_createPageTitle()} {breadcrumbs} />

<FreeTourForm
	form={data.form}
	mode="create"
	availableCategories={data.availableCategories}
	availableDestinations={data.availableDestinations}
/>
