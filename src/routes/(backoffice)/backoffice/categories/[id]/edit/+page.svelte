<script lang="ts">
	/**
	 * Edit category page.
	 * Loads the existing category data and renders the form in edit mode.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import CategoryForm from '../../components/CategoryForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: PageProps = $props();

	const breadcrumbs = $derived(
		buildBreadcrumbs(page.url.pathname, {
			label: data.category.name || m.categories_breadcrumbCategory()
		})
	);
</script>

<svelte:head>
	<title>{m.categories_editPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.categories_editPageTitle()} {breadcrumbs} />

<CategoryForm form={data.form} mode="edit" categoryId={data.category.id} />
