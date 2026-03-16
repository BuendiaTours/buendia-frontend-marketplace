<script lang="ts">
	/**
	 * Edit activity page.
	 * Full management view: UpdateDto fields + sub-resource management (locations, etc.).
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import ActivityForm from '../../components/ActivityForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: PageProps = $props();

	const breadcrumbs = $derived(
		buildBreadcrumbs(page.url.pathname, {
			label: data.activity.title || m.activities_breadcrumbResource()
		})
	);
</script>

<svelte:head>
	<title>{m.activities_editPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.activities_editPageTitle()} {breadcrumbs} />

<ActivityForm
	form={data.form}
	activityId={data.activity.id}
	availableSuppliers={data.availableSuppliers}
	locations={data.activity.locations ?? []}
	attractions={data.activity.attractions ?? []}
	meals={data.activity.meals ?? []}
/>
