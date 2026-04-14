<script lang="ts">
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import ContentBlockForm from '../../components/ContentBlockForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: PageProps = $props();
	const breadcrumbs = $derived(
		buildBreadcrumbs(page.url.pathname, {
			label: data.contentBlock.title || m.contentBlocks_breadcrumbResource()
		})
	);
</script>

<svelte:head><title>{m.contentBlocks_editPageTitle()} - Backoffice</title></svelte:head>
<LocationBar title={m.contentBlocks_editPageTitle()} {breadcrumbs} />
<ContentBlockForm
	form={data.form}
	mode="edit"
	contentBlockId={data.contentBlock.id}
	activityCount={data.contentBlock.activityCount}
	images={data.contentBlock.images}
/>
