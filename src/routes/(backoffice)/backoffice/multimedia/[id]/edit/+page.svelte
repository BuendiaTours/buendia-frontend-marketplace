<script lang="ts">
	/**
	 * Edit media page.
	 * Loads existing media data and renders the form in edit mode with the image editor.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import MediaForm from '../../components/MediaForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: PageProps = $props();

	const breadcrumbs = $derived(
		buildBreadcrumbs(page.url.pathname, {
			label: data.media.title || m.multimedia_breadcrumbResource()
		})
	);
</script>

<svelte:head>
	<title>{m.multimedia_editPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.multimedia_editPageTitle()} {breadcrumbs} />

<MediaForm form={data.form} mediaId={data.media.id} media={data.media} />
