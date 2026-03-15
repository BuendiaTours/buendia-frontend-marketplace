<script lang="ts">
	/**
	 * Create tag page.
	 * Renders an empty form for creating a new tag.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import TagForm from '../components/TagForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: PageProps = $props();

	const breadcrumbs = $derived(
		buildBreadcrumbs(page.url.pathname, { label: m.tags_breadcrumbNew() })
	);
</script>

<svelte:head>
	<title>{m.tags_createPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.tags_createPageTitle()} {breadcrumbs} />

<TagForm form={data.form} mode="create" />
