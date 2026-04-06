<script lang="ts">
	/**
	 * Edit FAQ page.
	 * Loads the existing FAQ data and renders the form in edit mode.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import FaqForm from '../../components/FaqForm.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';

	let { data }: PageProps = $props();

	const breadcrumbs = $derived(
		buildBreadcrumbs(page.url.pathname, {
			label: data.faq.question || m.faqs_breadcrumbResource()
		})
	);
</script>

<svelte:head>
	<title>{m.faqs_editPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.faqs_editPageTitle()} {breadcrumbs} />

<FaqForm form={data.form} mode="edit" faqId={data.faq.id} faqStatus={data.faq.status} />
