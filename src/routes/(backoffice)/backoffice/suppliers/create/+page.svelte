<script lang="ts">
	/**
	 * Create supplier page.
	 * Renders an empty form for creating a new supplier.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import SupplierForm from '../components/SupplierForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: PageProps = $props();

	const breadcrumbs = $derived(
		buildBreadcrumbs(page.url.pathname, { label: m.suppliers_breadcrumbNew() })
	);
</script>

<svelte:head>
	<title>{m.suppliers_createPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.suppliers_createPageTitle()} {breadcrumbs} />

<SupplierForm form={data.form} mode="create" />
