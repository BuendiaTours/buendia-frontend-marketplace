<script lang="ts">
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import ContentBlockForm from '../components/ContentBlockForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: PageProps = $props();
	const breadcrumbs = $derived(
		buildBreadcrumbs(page.url.pathname, { label: m.contentBlocks_breadcrumbNew() })
	);
</script>

<svelte:head><title>{m.contentBlocks_createPageTitle()} - Backoffice</title></svelte:head>
<LocationBar title={m.contentBlocks_createPageTitle()} {breadcrumbs} />
<ContentBlockForm form={data.form} mode="create" />
