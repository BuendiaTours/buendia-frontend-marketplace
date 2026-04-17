<script lang="ts">
	/**
	 * Free tour creation page — reuses the activity create form with kind=FREE_TOUR.
	 * The server action creates the underlying FREE_TOUR activity and then the
	 * free tour aggregation in sequence before redirecting to the aggregation edit.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import { FREE_TOUR_ROUTES } from '$lib/config/routes/backoffice/freeTours';
	import ActivityCreateForm from '../../activities/components/ActivityCreateForm.svelte';
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

<ActivityCreateForm
	form={data.form}
	listRoute={FREE_TOUR_ROUTES.list}
	backLabel={m.freeTours_backToList()}
	createLabel={m.freeTours_createResource()}
/>
