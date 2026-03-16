<script lang="ts">
	/**
	 * Create activity page.
	 * Simple form with only ActivityCreateDto fields.
	 * After creation, redirects to the edit page for full management.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import ActivityCreateForm from '../components/ActivityCreateForm.svelte';
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

<ActivityCreateForm form={data.form} />
