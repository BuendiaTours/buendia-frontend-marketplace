<script lang="ts">
	/**
	 * Edit tag page.
	 * Loads the existing tag data and renders the form in edit mode.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import TagForm from '../../components/TagForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: PageProps = $props();

	const breadcrumbs = $derived(
		buildBreadcrumbs(page.url.pathname, {
			label: data.tag.name || m.tags_breadcrumbTag()
		})
	);
</script>

<svelte:head>
	<title>{m.tags_editPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.tags_editPageTitle()} {breadcrumbs} />

<TagForm form={data.form} mode="edit" tagId={data.tag.id} />
