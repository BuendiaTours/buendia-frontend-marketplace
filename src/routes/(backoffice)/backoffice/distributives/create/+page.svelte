<script lang="ts">
	/**
	 * Create distributive page.
	 * Renders an empty form for creating a new distributive.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import DistributiveForm from '../components/DistributiveForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: PageProps = $props();

	const breadcrumbs = $derived(
		buildBreadcrumbs(page.url.pathname, { label: m.distributives_breadcrumbNew() })
	);
</script>

<svelte:head>
	<title>{m.distributives_createPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.distributives_createPageTitle()} {breadcrumbs} />

<DistributiveForm form={data.form} mode="create" />
