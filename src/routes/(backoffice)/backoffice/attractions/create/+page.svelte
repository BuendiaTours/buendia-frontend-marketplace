<script lang="ts">
	/**
	 * Create attraction page.
	 * Renders an empty form for creating a new attraction.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import AttractionForm from '../components/AttractionForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: PageProps = $props();

	const breadcrumbs = $derived(
		buildBreadcrumbs(page.url.pathname, { label: m.attractions_breadcrumbNew() })
	);
</script>

<svelte:head>
	<title>{m.attractions_createPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.attractions_createPageTitle()} {breadcrumbs} />

<AttractionForm form={data.form} mode="create" availableLocations={data.availableLocations} />
