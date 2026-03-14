<script lang="ts">
	/**
	 * Edit supplier page.
	 * Loads the existing supplier data and renders the form in edit mode.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import SupplierForm from '../../components/SupplierForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: PageProps = $props();

	const breadcrumbs = $derived(
		buildBreadcrumbs(page.url.pathname, {
			label: data.supplier.name || m.suppliers_breadcrumbSupplier()
		})
	);
</script>

<svelte:head>
	<title>{m.suppliers_editPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.suppliers_editPageTitle()} {breadcrumbs} />

<SupplierForm form={data.form} mode="edit" supplierId={data.supplier.id} />
