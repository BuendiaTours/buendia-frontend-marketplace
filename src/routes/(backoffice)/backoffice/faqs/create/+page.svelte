<script lang="ts">
	/**
	 * Create FAQ page.
	 * Renders an empty form for creating a new FAQ.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import FaqForm from '../components/FaqForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: PageProps = $props();

	const breadcrumbs = $derived(
		buildBreadcrumbs(page.url.pathname, { label: m.faqs_breadcrumbNew() })
	);
</script>

<svelte:head>
	<title>{m.faqs_createPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.faqs_createPageTitle()} {breadcrumbs} />

<FaqForm form={data.form} mode="create" />
