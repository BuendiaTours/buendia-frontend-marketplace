<script lang="ts">
	/**
	 * Edit pickup point page.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import PickupPointForm from '../../components/PickupPointForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: PageProps = $props();

	const breadcrumbs = $derived(
		buildBreadcrumbs(page.url.pathname, {
			label: data.pickupPoint.name || m.pickupPoints_breadcrumbResource()
		})
	);
</script>

<svelte:head>
	<title>{m.pickupPoints_editPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.pickupPoints_editPageTitle()} {breadcrumbs} />

<PickupPointForm form={data.form} mode="edit" pickupPointId={data.pickupPoint.id} />
