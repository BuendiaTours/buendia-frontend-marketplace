<script lang="ts">
	/**
	 * Create location page.
	 * Renders an empty form for creating a new location.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import LocationForm from '../components/LocationForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: PageProps = $props();

	const breadcrumbs = $derived(
		buildBreadcrumbs(page.url.pathname, { label: m.locations_breadcrumbNew() })
	);
</script>

<svelte:head>
	<title>{m.locations_createPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.locations_createPageTitle()} {breadcrumbs} />

<LocationForm form={data.form} mode="create" />
