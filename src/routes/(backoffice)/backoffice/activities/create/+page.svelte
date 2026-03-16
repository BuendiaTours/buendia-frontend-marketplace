<script lang="ts">
	/**
	 * Create activity page.
	 * Renders an empty form for creating a new activity.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import ActivityForm from '../components/ActivityForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: PageProps = $props();

	const breadcrumbs = $derived(
		buildBreadcrumbs(page.url.pathname, { label: m.activities_breadcrumbNew() })
	);
</script>

<svelte:head>
	<title>{m.activities_createPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.activities_createPageTitle()} {breadcrumbs} />

<ActivityForm form={data.form} mode="create" availableSuppliers={data.availableSuppliers} />
