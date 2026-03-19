<script lang="ts">
	/**
	 * Create pickup point page.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import PickupPointForm from '../components/PickupPointForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: PageProps = $props();

	const breadcrumbs = $derived(
		buildBreadcrumbs(page.url.pathname, { label: m.pickupPoints_breadcrumbNew() })
	);
</script>

<svelte:head>
	<title>{m.pickupPoints_createPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.pickupPoints_createPageTitle()} {breadcrumbs} />

<PickupPointForm form={data.form} mode="create" />
