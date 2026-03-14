<script lang="ts">
	/**
	 * Attraction detail page — read-only view with navigation to edit.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { enhance } from '$app/forms';
	import { confirmAction } from '$lib/actions/backoffice/confirmAction';
	import { ATTRACTION_ROUTES } from '$lib/config/routes/backoffice/attractions';
	import { buildBreadcrumbs } from '$lib/utils/breadcrumbsBackoffice';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';
	import DebugApiJson from '$lib/components/backoffice/debug/DebugApiJson.svelte';

	let { data }: PageProps = $props();
	const attraction = $derived(data.attraction);

	const breadcrumbs = $derived(
		buildBreadcrumbs(page.url.pathname, {
			label: attraction.name || m.attractions_breadcrumbAttraction()
		})
	);
</script>

<svelte:head>
	<title>{m.attractions_detailPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={attraction.name} {breadcrumbs} />

<div
	class="bnd-main-actions border-base-content/10 bg-base-100 sticky top-0 z-10 flex items-center justify-between gap-4 border-t py-4"
>
	<a href={`${ATTRACTION_ROUTES.list}?${page.url.searchParams.toString()}`} class="btn btn-ghost">
		← {m.attractions_backToList()}
	</a>

	<div class="flex gap-2">
		<a
			href={buildUrlWithFilters(ATTRACTION_ROUTES.edit(attraction.id), page.url.searchParams)}
			class="btn btn-outline btn-primary"
		>
			{m.attractions_editButton()}
		</a>

		<form method="POST" action={`${ATTRACTION_ROUTES.edit(attraction.id)}?/delete`} use:enhance>
			<button
				type="submit"
				class="btn btn-soft btn-error"
				use:confirmAction={{
					title: m.attractions_confirmDeleteTitle(),
					message: m.attractions_confirmDeleteMessage(),
					confirmText: m.common_delete(),
					cancelText: m.common_cancel(),
					danger: true
				}}
			>
				{m.attractions_deleteButton()}
			</button>
		</form>
	</div>
</div>

<DebugApiJson data={attraction} />
