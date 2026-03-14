<script lang="ts">
	/**
	 * Create category page.
	 * Renders an empty form for creating a new category.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import CategoryForm from '../components/CategoryForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: PageProps = $props();

	const breadcrumbs = $derived(
		buildBreadcrumbs(page.url.pathname, { label: m.categories_breadcrumbNew() })
	);
</script>

<svelte:head>
	<title>{m.categories_createPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.categories_createPageTitle()} {breadcrumbs} />

<CategoryForm form={data.form} mode="create" />
